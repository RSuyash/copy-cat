import re

def clean_text(text):
    """
    Cleans the input text by removing irrelevant characters, handling encoding issues, etc.
    """
    if not text:
        return None

    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)

    # Remove non-alphanumeric characters
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)

    # Convert to lowercase
    text = text.lower()

    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    return text

if __name__ == '__main__':
    # Example usage:
    dirty_text = "<h1>This is a dirty text</h1> with some <b>HTML tags</b> and special characters!@#$"
    cleaned_text = clean_text(dirty_text)
    print(f"Cleaned text: {cleaned_text}")