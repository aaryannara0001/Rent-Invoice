from fastapi import APIRouter, HTTPException
from src.config.db import supabase
from src.models.schemas import Record

router = APIRouter(tags=["Data Management"])

# --- CUSTOMERS (Flattened) ---
@router.get("/customers")
async def fetch_customers():
    res = supabase.table("customers").select("*").execute()
    return res.data

@router.post("/customers")
async def save_customer(record: Record):
    # Map JSON keys to DB columns
    d = record.data
    res = supabase.table("customers").upsert({
        "id": record.id,
        "name": d.get("name"),
        "phone": d.get("phone"),
        "email": d.get("email"),
        "address": d.get("address"),
        "gstin": d.get("gstin")
    }).execute()
    return res.data

@router.delete("/customers/{id}")
async def remove_customer(id: str):
    supabase.table("customers").delete().eq("id", id).execute()
    return {"status": "deleted", "id": id}

# --- INVOICES (Flattened) ---
@router.get("/invoices")
async def fetch_invoices():
    res = supabase.table("invoices").select("*").execute()
    # Return in the format the frontend expects (list of full objects)
    return res.data

@router.post("/invoices")
async def save_invoice(record: Record):
    d = record.data
    res = supabase.table("invoices").upsert({
        "id": record.id,
        "invoice_number": d.get("invoiceNumber"),
        "customer_id": d.get("customerId"),
        "customer_name": d.get("customerName"),
        "customer_phone": d.get("customerPhone"),
        "invoice_date": d.get("invoiceDate"),
        "due_date": d.get("dueDate"),
        "subtotal": d.get("subtotal"),
        "total_discount": d.get("totalDiscount"),
        "total_gst": d.get("totalGST"),
        "grand_total": d.get("grandTotal"),
        "status": d.get("status"),
        "items": d.get("items") # Keep items as JSON list
    }).execute()
    return res.data

@router.delete("/invoices/{id}")
async def remove_invoice(id: str):
    supabase.table("invoices").delete().eq("id", id).execute()
    return {"status": "deleted", "id": id}

# --- QUOTES (Flattened) ---
@router.get("/quotes")
async def fetch_quotes():
    res = supabase.table("quotes").select("*").execute()
    return res.data

@router.post("/quotes")
async def save_quote(record: Record):
    d = record.data
    res = supabase.table("quotes").upsert({
        "id": record.id,
        "quote_number": d.get("quoteNumber"),
        "customer_id": d.get("customerId"),
        "customer_name": d.get("customerName"),
        "quote_date": d.get("quoteDate"),
        "valid_until": d.get("validUntil"),
        "grand_total": d.get("grandTotal"),
        "status": d.get("status"),
        "items": d.get("items")
    }).execute()
    return res.data

@router.delete("/quotes/{id}")
async def remove_quote(id: str):
    supabase.table("quotes").delete().eq("id", id).execute()
    return {"status": "deleted", "id": id}

# --- ITEMS ---
@router.get("/items")
async def fetch_items():
    res = supabase.table("master_items").select("*").execute()
    return res.data

@router.post("/items")
async def save_item(record: Record):
    d = record.data
    res = supabase.table("master_items").upsert({
        "id": record.id,
        "name": d.get("name"),
        "price_per_day": d.get("pricePerDay"),
        "gst_percent": d.get("gstPercent"),
        "category": d.get("category")
    }).execute()
    return res.data

@router.delete("/items/{id}")
async def remove_item(id: str):
    supabase.table("master_items").delete().eq("id", id).execute()
    return {"status": "deleted", "id": id}

# --- PAYMENT METHODS ---
@router.get("/payment-methods")
async def fetch_payment_methods():
    res = supabase.table("payment_methods").select("*").execute()
    return [item.get("data") for item in res.data if "data" in item]

@router.post("/payment-methods")
async def save_payment_method(record: Record):
    # Keeping payment methods as JSON for convenience as they are small
    res = supabase.table("payment_methods").upsert({
        "id": record.id,
        "data": record.data
    }).execute()
    return res.data

@router.delete("/payment-methods/{id}")
async def remove_payment_method(id: str):
    supabase.table("payment_methods").delete().eq("id", id).execute()
    return {"status": "deleted", "id": id}
