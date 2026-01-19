import httpx
import json
from typing import Optional, Generator, AsyncGenerator, List, Dict
from app.core.config import settings

class InferenceService:

    def __init__(self):

        self.server_url = settings.LLAMA_SERVER_URL
        self.client = httpx.Client(timeout=300.0)
        self.async_client = httpx.AsyncClient(timeout=300.0)
        self.model_loaded = False

    def check_health(self) -> bool:

        try:
            response = self.client.get(f"{self.server_url}/health")
            self.model_loaded = response.status_code == 200
            return self.model_loaded
        except Exception:
            self.model_loaded = False
            return False

    def generate_response(
        self,
        prompt: str,
        max_tokens: int = None,
        temperature: float = None,
        top_p: float = None
    ) -> str:

        if max_tokens is None:
            max_tokens = settings.MODEL_MAX_TOKENS
        if temperature is None:
            temperature = settings.MODEL_TEMPERATURE
        if top_p is None:
            top_p = settings.MODEL_TOP_P

        request_data = {
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": top_p,
            "stream": False
        }

        try:
            response = self.client.post(
                f"{self.server_url}/v1/chat/completions",
                json=request_data
            )
            response.raise_for_status()

            result = response.json()

            if "choices" in result and len(result["choices"]) > 0:
                message = result["choices"][0].get("message", {})
                content = message.get("content", "")
                return content.strip()
            else:
                raise ValueError("Invalid response format from llama-server")

        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"LLM server error: {e.response.status_code}")
        except Exception as e:
            raise RuntimeError(f"Failed to generate response: {str(e)}")

    def generate_response_stream(
        self,
        prompt: str,
        max_tokens: int = None,
        temperature: float = None,
        top_p: float = None
    ) -> Generator[str, None, None]:

        if max_tokens is None:
            max_tokens = settings.MODEL_MAX_TOKENS
        if temperature is None:
            temperature = settings.MODEL_TEMPERATURE
        if top_p is None:
            top_p = settings.MODEL_TOP_P

        request_data = {
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": top_p,
            "stream": True
        }

        try:
            with self.client.stream(
                "POST",
                f"{self.server_url}/v1/chat/completions",
                json=request_data,
                timeout=300.0
            ) as response:
                response.raise_for_status()

                for line in response.iter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]

                        if data_str.strip() == "[DONE]":
                            break

                        try:
                            data = json.loads(data_str)
                            if "choices" in data and len(data["choices"]) > 0:
                                delta = data["choices"][0].get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    yield content
                        except json.JSONDecodeError:
                            continue

        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"LLM server error: {e.response.status_code}")
        except Exception as e:
            raise RuntimeError(f"Failed to stream response: {str(e)}")

    async def generate_response_stream_async(
        self,
        prompt: str = None,
        messages: List[Dict] = None,
        max_tokens: int = None,
        temperature: float = None,
        top_p: float = None
    ) -> AsyncGenerator[str, None]:

        if max_tokens is None:
            max_tokens = settings.MODEL_MAX_TOKENS
        if temperature is None:
            temperature = settings.MODEL_TEMPERATURE
        if top_p is None:
            top_p = settings.MODEL_TOP_P

        if messages is None:
            if prompt is None:
                raise ValueError("Either prompt or messages must be provided")
            messages = [{"role": "user", "content": prompt}]

        request_data = {
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": top_p,
            "stream": True
        }

        try:
            async with self.async_client.stream(
                "POST",
                f"{self.server_url}/v1/chat/completions",
                json=request_data,
                timeout=300.0
            ) as response:
                response.raise_for_status()

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]

                        if data_str.strip() == "[DONE]":
                            break

                        try:
                            data = json.loads(data_str)
                            if "choices" in data and len(data["choices"]) > 0:
                                delta = data["choices"][0].get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    yield content
                        except json.JSONDecodeError:
                            continue

        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"LLM server error: {e.response.status_code}")
        except Exception as e:
            raise RuntimeError(f"Failed to stream response: {str(e)}")

    async def generate_title(self, first_message: str) -> str:

        title_prompt = f

        messages = [{"role": "user", "content": title_prompt}]

        request_data = {
            "messages": messages,
            "max_tokens": 20,
            "temperature": 0.7,
            "top_p": 0.95,
            "stream": False
        }

        try:
            response = await self.async_client.post(
                f"{self.server_url}/v1/chat/completions",
                json=request_data
            )
            response.raise_for_status()
            result = response.json()

            if "choices" in result and len(result["choices"]) > 0:
                message = result["choices"][0].get("message", {})
                title = message.get("content", "").strip()

                if title and len(title.split()) <= 6:
                    return title

            return first_message[:50] + ("..." if len(first_message) > 50 else "")

        except Exception:
            return first_message[:50] + ("..." if len(first_message) > 50 else "")

    def __del__(self):

        if hasattr(self, 'client'):
            self.client.close()
        if hasattr(self, 'async_client'):
            import asyncio
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.create_task(self.async_client.aclose())
                else:
                    loop.run_until_complete(self.async_client.aclose())
            except:
                pass

inference_service = InferenceService()
