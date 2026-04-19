from fastapi import APIRouter
from src.config.db import supabase

router = APIRouter(prefix="/analytics", tags=["Statistics"])

@router.get("/summary")
async def get_summary():
    # Fetch all data for calculation
    invs_res = supabase.table("invoices").select("*").execute()
    quotes_res = supabase.table("quotes").select("*").execute()
    customers_res = supabase.table("customers").select("*").execute()

    invoices = [i['data'] for i in invs_res.data]
    quotes = [q['data'] for q in quotes_res.data]
    
    total_revenue = sum(inv['grandTotal'] for inv in invoices if inv.get('status') == 'paid')
    pending_amount = sum(inv['grandTotal'] for inv in invoices if inv.get('status') in ['pending', 'sent'])
    
    stats = {
        "revenue": total_revenue,
        "pending": pending_amount,
        "invoice_count": len(invoices),
        "quote_count": len(quotes),
        "customer_count": len(customers_res.data),
        "conversion_rate": (len([q for q in quotes if q.get('status') == 'converted']) / len(quotes) * 100) if quotes else 0
    }
    
    return stats
