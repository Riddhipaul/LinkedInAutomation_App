from playwright.sync_api import sync_playwright
from urllib.parse import quote


def scrape_jobs(keyword="GenAI Developer",
                location="India",
                experience=None,
                timeframe=None):

    jobs = []

    print("Values:", keyword, location, experience, timeframe)

    # Encode URL parameters
    keyword = quote(keyword)
    location = quote(location)

    # Experience mapping
    exp_map = {
        "intern": "1",
        "entry": "2",
        "associate": "3",
        "mid": "4"
    }

    # Timeframe mapping
    time_map = {
        "day": "r86400",
        "week": "r604800",
        "month": "r2592000"
    }

    base_url = f"https://www.linkedin.com/jobs/search/?keywords={keyword}&location={location}"

    if experience:
        exp_filter = exp_map.get(experience.lower())
        if exp_filter:
            base_url += f"&f_E={exp_filter}"

    if timeframe:
        time_filter = time_map.get(timeframe.lower())
        if time_filter:
            base_url += f"&f_TPR={time_filter}"

    print("LinkedIn URL:", base_url)

    with sync_playwright() as p:
        try:

            browser = p.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage"
                ]
            )

            page = browser.new_page()

            page.goto(base_url, timeout=60000)

            # wait for jobs to load
            page.wait_for_selector(".base-card", timeout=15000)

            job_cards = page.query_selector_all(".base-card")

            for card in job_cards[:20]:

                title_el = card.query_selector(".base-search-card__title")
                company_el = card.query_selector(".base-search-card__subtitle")
                link_el = card.query_selector("a")

                title = title_el.inner_text().strip() if title_el else ""
                company = company_el.inner_text().strip() if company_el else ""
                link = link_el.get_attribute("href") if link_el else ""

                jobs.append({
                    "title": title,
                    "company": company,
                    "link": link,
                    "location": location,
                    "experience_level": experience,
                    "timeframe": timeframe,
                    "applied": False
                })

            browser.close()

            return jobs

        except Exception as e:
            print("Scraping failed:", e)

            # fallback response
            return [{
                "title": "Scraper Failed",
                "company": "LinkedIn",
                "location": location,
                "link": e,
                "applied": False
            }]
