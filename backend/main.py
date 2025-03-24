from data_loader import load_gutenberg_data, load_reuters_data, load_enron_data
from data_cleaning import clean_text

def main():
    # Load data from Gutenberg
    gutenberg_url = "https://www.gutenberg.org/files/2701/2701-h/2701-h.htm"  # Example: Moby Dick
    gutenberg_text = load_gutenberg_data(gutenberg_url)
    if gutenberg_text:
        print(f"Loaded {len(gutenberg_text)} characters from Gutenberg")
        cleaned_gutenberg_text = clean_text(gutenberg_text)
        if cleaned_gutenberg_text:
            print(f"Cleaned Gutenberg text: {len(cleaned_gutenberg_text)} characters")
        else:
            print("Failed to clean Gutenberg text.")
    else:
        print("Failed to load Gutenberg text.")

    # Load data from Reuters (placeholder)
    reuters_data = load_reuters_data()
    if reuters_data:
        print("Loaded Reuters data")
    else:
        print("Failed to load Reuters data.")

    # Load data from Enron (placeholder)
    enron_data = load_enron_data()
    if enron_data:
        print("Loaded Enron data")
    else:
        print("Failed to load Enron data.")

if __name__ == "__main__":
    main()
