from typing import List,Dict,Any,AsyncGenerator
from core.config import settings
import httpx
import json



async def stream_rag_response(query:str,ctx_chunks:List[Dict[str,Any]]) ->AsyncGenerator[str,None]:
    context_text = "\n\n".join(
        [f"[Page {c['page_number']}]: {c['page_content']}" for c in ctx_chunks]
    )

    system_prompt = (
        "You are an enterprise AI assistant. "
        "Answer the user's question strictly using the provided document context.\n\n"
        f"Context:\n{context_text}"
    )

    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": settings.DEFAULT_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query}
        ],
        "stream": True
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream("POST",settings.GROQ_BASE_URL,headers=headers,payload=payload) as reponse:
            reponse.raise_for_status()
            async for line in reponse.aiter_lines():
                if line.startswith("data: "):
                    data_str = line[6:].strip()
                    if data_str == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data_str)
                        delta = chunk["choices"][0]["delta"]
                        token = delta.get("content","")
                        if token:
                            yield token
                    except json.JSONDecodeError:
                        continue

                
