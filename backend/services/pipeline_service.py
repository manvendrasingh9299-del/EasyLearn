# services/pipeline_service.py

from services.pdf_service import extract_text_from_pdf
from services.chunk_service import chunk_text
from services.ai_service import generate_summary
from database import summary_collection


STRUCTURED_PROMPT_TEMPLATE = """
You are an academic assistant.

Summarize the following content in this exact structure:

Topic:
Important Points:
Key Concepts:
Simple Explanation:
Exam Summary:

Content:
{content}
"""


async def process_pdf(file_path: str):
    # Step 1: Extract text
    text = extract_text_from_pdf(file_path)

    # Step 2: Chunk text
    chunks = chunk_text(text)

    section_summaries = []

    # Step 3: Process each chunk
    for chunk in chunks:
        prompt = STRUCTURED_PROMPT_TEMPLATE.format(content=chunk)
        result = generate_summary(prompt)
        section_summaries.append(result)

    # Step 4: Merge summaries
    final_output = "\n\n".join(section_summaries)

    # Step 5: Save to MongoDB
    await summary_collection.insert_one({
        "summary": final_output
    })

    return final_output