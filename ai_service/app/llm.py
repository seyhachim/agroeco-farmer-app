import os
import re

from openai import OpenAI

VLLM_BASE_URL = os.getenv("VLLM_BASE_URL", "http://localhost:8080/v1")
VLLM_API_KEY = os.getenv("VLLM_API_KEY", "token-agroeco")
MODEL = os.getenv("VLLM_MODEL", "aisingapore/Gemma-SEA-LION-v3-9B-IT")

_client = OpenAI(base_url=VLLM_BASE_URL, api_key=VLLM_API_KEY)


def generate_answer(question: str, context: str, web_context: str = "") -> str:
    has_context = bool(context and context.strip())
    has_web = bool(web_context and web_context.strip())

    context_block = f"""ព័ត៌មានដែលរកបាន (Context):
{context}""" if has_context else "គ្មានព័ត៌មានដែលពាក់ព័ន្ធ"

    web_block = f"""ព័ត៌មានពីអ៊ីនធឺណិត (Web):
{web_context}""" if has_web else ""

    prompt = f"""អ្នកគឺជា AgroEco Farmer Assistant — ជំនួយការកសិកម្មឆ្លាតវៃ ដែលជំនាញខាង ការដាំដំណាំ ការគ្រប់គ្រងដី ការប្រើជី ការការពារសត្វល្អិតនិងជំងឺ ទីផ្សារស្រូវ-ទំនិញ និងចំណេះដឹងកសិកម្មរបស់កម្ពុជា។

ច្បាប់ (Rules):
- ឆ្លើយជាភាសាខ្មែរ បើសំណួរជាភាសាខ្មែរ
- ឆ្លើយជាភាសាអង់គ្លេស បើសំណួរជាភាសាអង់គ្លេស
- ប្រើភាសាខ្មែរ ត្រឹមត្រូវ ច្បាស់លាស់ ងាយយល់ — ជៀសវាង ខ្មែរ "Google Translate" ឬ ភ្ជោះច្រើនពេក
- ឆ្លើយដោយផ្អែកលើ Context ដែលផ្ដល់ — កុំ invent ព័ត៌មានថ្មី
- បើ Context គ្មានព័ត៌មានពាក់ព័ន្ធ ប្រាប់ User ថា "ចម្លើយនេះ ខ្ញុំបច្ចុប្បន្ន​ មិនទាន់មានព័ត៌មាន​ ច្បាស់លាស់ ប៉ុន្តែ..." ហើយ ផ្ដល់ advice ទូទៅ​ ដែលត្រឹមត្រូវ
- ឆ្លើយ ខ្លី ត្រឹមត្រូវ ជៀសវាង padding ឬ filler ព្រំ (unnecessary words)
- ប្រើ bullet points ឬ numbered list ពេល list steps ឬ recommendations
- ប្រើ អង់គ្លេស សម្រាប់ technical terms ដែល មិនមាន ខ្មែរ ត្រឹមត្រូវ (ដូចជា: pH, NPK, IPM, drip irrigation) — ប៉ុន្តែ បញ្ជាក់ ខ្មែរ នៅជាប់
- ប្រើ Markdown សុទ្ធ (headings ជា #, list ជា - ឬ 1.) — មិនត្រូវ ប្រើ HTML tags ដូចជា <h1>, <p>, <div>, <img> ជាដើម ឡើយ

{context_block}

{web_block}

សំណួរ: {question}

ចម្លើយ:"""

    response = _client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        top_p=0.9,
        extra_body={"repetition_penalty": 1.1},
    )

    answer = response.choices[0].message.content
    return strip_html_tags(answer)


def strip_html_tags(text: str) -> str:
    """Remove stray HTML tags the model may emit, keeping their text content."""
    return re.sub(r"<[^>]+>", "", text)
