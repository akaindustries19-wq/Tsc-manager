# Web UI and API Documentation

## Overview

The TSC Manager now includes a modern web-based user interface and REST API, making it easy to manage AI agents through a browser and integrate with other applications.

## Features

### Web Dashboard
- **Modern UI**: Clean, responsive interface with real-time updates
- **Task Management**: Submit instructions, view tasks, and manage approvals
- **Real-time Updates**: WebSocket connection for instant notifications
- **Statistics**: Live dashboard showing task counts and status
- **Filtering**: Filter tasks by status and platform
- **Embeddable**: Can be embedded in other webpages via iframe or web component

### Security Features
- **API Key Authentication**: Secure API access with API keys
- **Rate Limiting**: Protection against abuse (100 requests per 15 minutes)
- **Input Sanitization**: XSS protection and input validation
- **Security Headers**: Helmet.js for HTTP security headers
- **Content Security Policy**: CSP headers to prevent XSS attacks
- **CORS Support**: Configurable cross-origin resource sharing

### API Endpoints

All API endpoints require authentication via the `X-API-Key` header or `apiKey` query parameter.

#### Health Check
```
GET /health
```
No authentication required. Returns server health status.

#### Tasks

**Get All Tasks**
```
GET /api/tasks
Headers: X-API-Key: your-api-key
```

**Get Tasks by Status**
```
GET /api/tasks/status/:status
Headers: X-API-Key: your-api-key

Status values: PENDING, APPROVED, IN_PROGRESS, COMPLETED, FAILED, REJECTED
```

**Get Tasks by Platform**
```
GET /api/tasks/platform/:platform
Headers: X-API-Key: your-api-key

Platform values: WIX, SLACK, GITHUB, BING_COPILOT, GEMINI, CLAUDE
```

**Get Specific Task**
```
GET /api/tasks/:id
Headers: X-API-Key: your-api-key
```

#### Instructions

**Submit Instruction**
```
POST /api/instructions
Headers: 
  Content-Type: application/json
  X-API-Key: your-api-key
Body:
{
  "instruction": "Create a landing page on Wix",
  "userId": "optional-user-id"
}
```

#### Approvals

**Get Pending Approvals**
```
GET /api/approvals
Headers: X-API-Key: your-api-key
```

**Approve Task**
```
POST /api/approvals/:id/approve
Headers: X-API-Key: your-api-key
```

**Reject Task**
```
POST /api/approvals/:id/reject
Headers: X-API-Key: your-api-key
```

#### Platforms

**Get Available Platforms**
```
GET /api/platforms
Headers: X-API-Key: your-api-key
```

### WebSocket

Connect to receive real-time updates:
```
ws://localhost:3000/ws
```

**Message Types:**
- `connected`: Connection established
- `subscribed`: Subscribed to updates
- `tasks_created`: New tasks created
- `task_approved`: Task approved
- `task_rejected`: Task rejected

## Getting Started

### Start the Server

1. Set environment variables:
```bash
export API_KEY=your-secret-key
export PORT=3000
```

2. Start the server:
```bash
npm run server
```

Or in production:
```bash
npm run server:prod
```

### Access the UI

Open your browser to:
```
http://localhost:3000
```

The UI will automatically connect and display the dashboard.

### API Usage Example

**Using curl:**
```bash
# Submit an instruction
curl -X POST http://localhost:3000/api/instructions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-key" \
  -d '{"instruction": "Create a website on Wix"}'

# Get all tasks
curl -X GET http://localhost:3000/api/tasks \
  -H "X-API-Key: your-secret-key"

# Approve a task
curl -X POST http://localhost:3000/api/approvals/{approval-id}/approve \
  -H "X-API-Key: your-secret-key"
```

**Using JavaScript:**
```javascript
const API_KEY = 'your-secret-key';
const API_BASE = 'http://localhost:3000';

async function submitInstruction(instruction) {
  const response = await fetch(`${API_BASE}/api/instructions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({ instruction })
  });
  
  return await response.json();
}

// Use it
submitInstruction('Create a landing page on Wix')
  .then(data => console.log(data));
```

## Embedding

### Method 1: iframe

```html
<iframe 
  src="http://localhost:3000/?apiKey=your-api-key" 
  width="100%" 
  height="800px" 
  frameborder="0"
></iframe>
```

### Method 2: Web Component

```html
<!-- Include the widget script -->
<script src="http://localhost:3000/widget.js"></script>

<!-- Use the custom element -->
<tsc-manager-widget 
  api-key="your-api-key"
  height="800px"
></tsc-manager-widget>
```

### Embedding Attributes

- `api-key`: Your API key for authentication
- `api-url`: Base URL of the API (default: current origin)
- `height`: Height of the widget (default: 600px)

## Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3000                    # Server port
API_KEY=default-api-key      # Single API key
API_KEYS=key1,key2,key3      # Multiple API keys (comma-separated)
NODE_ENV=production          # Environment mode

# Platform Credentials
GITHUB_TOKEN=...
SLACK_BOT_TOKEN=...
WIX_API_KEY=...
BING_API_KEY=...
GEMINI_API_KEY=...
CLAUDE_API_KEY=...
```

### Security Best Practices

1. **Use Strong API Keys**: Generate secure, random API keys
2. **Use HTTPS**: Always use HTTPS in production
3. **Rotate Keys**: Regularly rotate API keys
4. **Limit Origins**: Configure CORS to allow only trusted origins
5. **Monitor Usage**: Keep track of API usage and set up alerts

## Architecture

```
┌─────────────────┐
│   Web Browser   │
│   (Frontend)    │
└────────┬────────┘
         │ HTTP/WebSocket
         │
┌────────▼────────┐
│  Express Server │
│  - REST API     │
│  - WebSocket    │
│  - Security     │
└────────┬────────┘
         │
┌────────▼────────┐
│   AI Manager    │
│  - TaskManager  │
│  - Delegator    │
│  - Platforms    │
└─────────────────┘
```

## Error Handling

The API returns standard HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing API key)
- `403`: Forbidden (invalid API key)
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

Error responses include a JSON body:
```json
{
  "error": "Description of the error"
}
```

## Rate Limiting

- **Default Limit**: 100 requests per 15 minutes per IP address
- **Applies To**: All `/api/*` endpoints
- **Response**: HTTP 429 with retry information

## WebSocket Protocol

**Client -> Server:**
```json
{
  "type": "subscribe"
}
```

**Server -> Client:**
```json
{
  "type": "tasks_created",
  "tasks": [...]
}
```

## Troubleshooting

### Common Issues

**1. Cannot connect to server**
- Ensure the server is running: `npm run server`
- Check the port is not in use
- Verify firewall settings

**2. API returns 401/403**
- Check API key is correct
- Ensure `X-API-Key` header is set
- Verify API key is in environment variables

**3. WebSocket connection fails**
- Check WebSocket URL format
- Ensure server supports WebSocket
- Check for proxy/firewall blocking WebSocket

**4. CORS errors**
- Server allows all origins by default for embedding
- Check browser console for specific CORS errors

## Examples

See the `public/embed-example.html` file for a complete embedding example.

## License

MIT
