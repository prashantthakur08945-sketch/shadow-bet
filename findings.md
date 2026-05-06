# Research & Findings
## Discoveries
### Airtable Automation (Python)
- **API**: Uses Airtable REST API (Personal Access Tokens are required).
- **Rate Limits**: 5 requests per second; 429 errors require retry logic/exponential backoff.
- **Batching**: Supports up to 10 records per request for create/update/delete.
- **Stability**: Use Table IDs (`tbl...`) instead of names to avoid breaks when users rename tables.
- **Polling**: Use "Last Modified Time" field for efficient sync instead of full dumps.

## Constraints
- No native Python execution within Airtable; requires external hosting or webhooks.
- .env isolation is critical for PAT/Base IDs.
