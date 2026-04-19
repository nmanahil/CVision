import requests
from bs4 import BeautifulSoup
from utils.skills import extract_skills


def scrape_url(url):
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "en-US,en;q=0.9",
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Remove noise
        for tag in soup(["script", "style", "nav", "header", "footer", "aside"]):
            tag.decompose()

        # Try known job description containers first
        for selector in [
            {"class": lambda c: c and any(
                kw in " ".join(c).lower()
                for kw in ["job-description", "jobdescription", "description", "job-details", "posting-body"]
            )},
        ]:
            container = soup.find(["div", "section", "article"], selector)
            if container:
                text = container.get_text(separator=" ", strip=True)
                if len(text) > 200:
                    return text

        # Fallback: grab all meaningful text blocks
        tags = soup.find_all(["p", "li", "span", "h1", "h2", "h3", "h4"])
        text = " ".join(t.get_text(separator=" ", strip=True) for t in tags if t.get_text(strip=True))
        return text

    except Exception as e:
        return ""


def extract_job_skills(job_input):
    scraped_text = None

    if job_input.strip().startswith("http"):
        scraped_text = scrape_url(job_input.strip())
        text = scraped_text if scraped_text else ""
    else:
        text = job_input

    job_skills = extract_skills(text)
    return {
        "skills": job_skills,
        "scraped_text": scraped_text[:600] if scraped_text else None
    }
