import asyncio
import json
import os
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
DATA_FILE = os.path.join(DATA_DIR, "pulseops_store.json")

class MockCursor:
    """Async iterator mimicking Motor cursor for offline store"""
    def __init__(self, items: List[Dict[str, Any]], sort_key: Optional[str] = None, reverse: bool = False):
        self._items = list(items)
        if sort_key:
            self._items.sort(key=lambda x: x.get(sort_key, ""), reverse=reverse)
        self._idx = 0

    def sort(self, key_or_list, direction=1):
        if isinstance(key_or_list, list):
            k, d = key_or_list[0]
            self._items.sort(key=lambda x: x.get(k, ""), reverse=(d < 0))
        elif isinstance(key_or_list, str):
            self._items.sort(key=lambda x: x.get(key_or_list, ""), reverse=(direction < 0))
        return self

    def limit(self, count: int):
        self._items = self._items[:count]
        return self

    def __aiter__(self):
        self._idx = 0
        return self

    async def __anext__(self):
        if self._idx >= len(self._items):
            raise StopAsyncIteration
        item = self._items[self._idx]
        self._idx += 1
        return item

    async def to_list(self, length: Optional[int] = None):
        if length is not None:
            return self._items[:length]
        return list(self._items)

class LocalAsyncCollection:
    """Zero-setup JSON-persisted async collection matching Motor's interface"""
    def __init__(self, name: str):
        self.name = name
        os.makedirs(DATA_DIR, exist_ok=True)
        if not os.path.exists(DATA_FILE):
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                json.dump({"tickets": [], "activity_logs": []}, f, indent=2)

    def _load(self) -> Dict[str, List[Dict[str, Any]]]:
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {"tickets": [], "activity_logs": []}

    def _save(self, data: Dict[str, List[Dict[str, Any]]]):
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        data = self._load().get(self.name, [])
        for doc in data:
            if all(doc.get(k) == v for k, v in query.items()):
                return dict(doc)
        return None

    def find(self, query: Optional[Dict[str, Any]] = None) -> MockCursor:
        data = self._load().get(self.name, [])
        if not query:
            return MockCursor(data)
        
        filtered = []
        for doc in data:
            match = True
            for k, v in query.items():
                if isinstance(v, dict) and "$in" in v:
                    if doc.get(k) not in v["$in"]:
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                filtered.append(doc)
        return MockCursor(filtered)

    async def insert_one(self, doc: Dict[str, Any]):
        data = self._load()
        if self.name not in data:
            data[self.name] = []
        doc_copy = dict(doc)
        data[self.name].append(doc_copy)
        self._save(data)
        return type("InsertResult", (), {"inserted_id": doc_copy.get("id", doc_copy.get("_id"))})()

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        data = self._load()
        coll = data.get(self.name, [])
        matched = False
        for i, doc in enumerate(coll):
            if all(doc.get(k) == v for k, v in query.items()):
                matched = True
                if "$set" in update:
                    doc.update(update["$set"])
                if "$push" in update:
                    for k, val in update["$push"].items():
                        if k not in doc or not isinstance(doc[k], list):
                            doc[k] = []
                        doc[k].append(val)
                coll[i] = doc
                break
        if matched:
            data[self.name] = coll
            self._save(data)
        return type("UpdateResult", (), {"matched_count": 1 if matched else 0, "modified_count": 1 if matched else 0})()

    async def delete_one(self, query: Dict[str, Any]):
        data = self._load()
        coll = data.get(self.name, [])
        for i, doc in enumerate(coll):
            if all(doc.get(k) == v for k, v in query.items()):
                del coll[i]
                data[self.name] = coll
                self._save(data)
                return type("DeleteResult", (), {"deleted_count": 1})()
        return type("DeleteResult", (), {"deleted_count": 0})()

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        cursor = self.find(query)
        return len(cursor._items)


class DatabaseManager:
    def __init__(self):
        self.is_connected_to_mongo = False
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.tickets = LocalAsyncCollection("tickets")
        self.activity_logs = LocalAsyncCollection("activity_logs")

    async def connect(self):
        try:
            client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1500)
            # Verify connectivity
            await client.admin.command('ping')
            self.client = client
            self.db = client[settings.DB_NAME]
            self.tickets = self.db["tickets"]
            self.activity_logs = self.db["activity_logs"]
            self.is_connected_to_mongo = True
            print("[PulseOps DB] Connected successfully to live MongoDB instance.")
        except Exception as e:
            self.is_connected_to_mongo = False
            self.tickets = LocalAsyncCollection("tickets")
            self.activity_logs = LocalAsyncCollection("activity_logs")
            print(f"[PulseOps DB] Live MongoDB not reachable ({e}). Using persistent Local File Store fallback.")

    async def close(self):
        if self.client:
            self.client.close()

db_manager = DatabaseManager()
