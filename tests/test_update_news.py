import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import update_news


class NewsTests(unittest.TestCase):
    def test_plain_removes_html_and_whitespace(self):
        self.assertEqual(update_news.plain("<p>World  &amp;  Asia</p>"), "World & Asia")

    def test_entry_time_is_utc(self):
        entry = {"pubdate": "Sat, 10 Oct 2026 04:30:00 GMT"}
        self.assertEqual(update_news.entry_time(entry), datetime(2026, 10, 10, 4, 30, tzinfo=timezone.utc))

    def test_fallback_does_not_fake_chinese_summaries(self):
        article = {"title": "Headline", "description": "News excerpt", "source": "BBC World", "url": "https://example.org/news", "published_at": "2026-10-10T04:00:00+00:00", "local_date": "2026-10-10"}
        out = update_news.rss_only([article])
        self.assertEqual(out["mode"], "rss_only")
        self.assertEqual(out["articles"][0]["title"], "Headline")

    def test_fetch_deduplicates(self):
        xml = b'''<?xml version="1.0"?><rss version="2.0"><channel><title>Test</title>
        <item><title>Major international event</title><description>A description</description><link>https://example.org/a</link><pubDate>Sat, 10 Oct 2026 04:00:00 GMT</pubDate></item>
        </channel></rss>'''
        class MockResp:
            content = xml
            def raise_for_status(self): pass
        with patch.object(update_news.requests, 'get', return_value=MockResp()):
            articles = update_news.fetch_articles(datetime(2026,10,10,5,tzinfo=timezone.utc))
        self.assertEqual(len(articles), 1)
        self.assertEqual(articles[0]["title"], "Major international event")

if __name__ == "__main__":
    unittest.main()
