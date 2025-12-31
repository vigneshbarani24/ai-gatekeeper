# ElevenLabs Tools - JSON Format

Copy and paste each of these JSON objects when adding tools in the ElevenLabs dashboard.

---

## Tool 1: check_calendar

```json
{
  "type": "webhook",
  "name": "check_calendar",
  "description": "Check user's calendar availability for a specific date and time",
  "disable_interruptions": false,
  "force_pre_tool_speech": "auto",
  "assignments": [],
  "tool_call_sound": null,
  "tool_call_sound_behavior": "auto",
  "execution_mode": "immediate",
  "api_schema": {
    "url": "https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/check_calendar",
    "method": "POST",
    "path_params_schema": [],
    "query_params_schema": [],
    "request_body_schema": {
      "id": "body",
      "type": "object",
      "description": "Calendar availability check request",
      "properties": [
        {
          "id": "date",
          "type": "string",
          "value_type": "llm_prompt",
          "description": "Date in YYYY-MM-DD format",
          "dynamic_variable": "",
          "constant_value": "",
          "enum": null,
          "is_system_provided": false,
          "required": true
        },
        {
          "id": "time",
          "type": "string",
          "value_type": "llm_prompt",
          "description": "Time in HH:MM format (24-hour)",
          "dynamic_variable": "",
          "constant_value": "",
          "enum": null,
          "is_system_provided": false,
          "required": true
        },
        {
          "id": "duration_minutes",
          "type": "integer",
          "value_type": "llm_prompt",
          "description": "Duration in minutes",
          "dynamic_variable": "",
          "constant_value": "",
          "enum": null,
          "is_system_provided": false,
          "required": false
        }
      ],
      "required": false,
      "value_type": "llm_prompt"
    },
    "request_headers": [
      {
        "type": "value",
        "name": "Content-Type",
        "value": "application/json"
      }
    ],
    "auth_connection": null
  },
  "response_timeout_secs": 30,
  "dynamic_variables": {
    "dynamic_variable_placeholders": {}
  }
}
```

---

## Tool 2: book_calendar

```json
{
  "type": "webhook",
  "name": "book_calendar",
  "description": "Book an event on user's Google Calendar",
  "disable_interruptions": false,
  "force_pre_tool_speech": "auto",
  "assignments": [],
  "tool_call_sound": null,
  "tool_call_sound_behavior": "auto",
  "execution_mode": "immediate",
  "api_schema": {
    "url": "https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/book_calendar",
    "method": "POST",
    "path_params_schema": [],
    "query_params_schema": [],
    "request_body_schema": {
      "id": "body",
      "type": "object",
      "description": "Calendar booking request",
      "properties": [
        {
          "id": "title",
          "type": "string",
          "value_type": "llm_prompt",
          "description": "Event title",
          "dynamic_variable": "",
          "constant_value": "",
          "enum": null,
          "is_system_provided": false,
          "required": true
        },
        {
          "id": "date",
          "type": "string",
          "value_type": "llm_prompt",
          "description": "Date in YYYY-MM-DD format",
          "dynamic_variable": "",
          "constant_value": "",
          "enum": null,
          "is_system_provided": false,
          "required": true
        },
        {
          "id": "time",
          "type": "string",
          "value_type": "llm_prompt",
          "description": "Time in HH:MM format (24-hour)",
          "dynamic_variable": "",
          "constant_value": "",
          "enum": null,
          "is_system_provided": false,
          "required": true
        },
        {
          "id": "duration_minutes",
          "type": "integer",
          "value_type": "llm_prompt",
          "description": "Duration in minutes",
          "dynamic_variable": "",
          "constant_value": "",
          "enum": null,
          "is_system_provided": false,
          "required": false
        }
      ],
      "required": false,
      "value_type": "llm_prompt"
    },
    "request_headers": [
      {
        "type": "value",
        "name": "Content-Type",
        "value": "application/json"
      }
    ],
    "auth_connection": null
  },
  "response_timeout_secs": 30,
  "dynamic_variables": {
    "dynamic_variable_placeholders": {}
  }
}
```

---

## Tool 3: check_contact

```json
{
  "type": "webhook",
  "name": "check_contact",
  "description": "Check if caller is in user's contact list",
  "disable_interruptions": false,
  "force_pre_tool_speech": "auto",
  "assignments": [],
  "tool_call_sound": null,
  "tool_call_sound_behavior": "auto",
  "execution_mode": "immediate",
  "api_schema": {
    "url": "https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/check_contact",
    "method": "POST",
    "path_params_schema": [],
    "query_params_schema": [],
    "request_body_schema": {
      "id": "body",
      "type": "object",
      "description": "Contact verification request",
      "properties": [
        {
          "id": "phone_number",
          "type": "string",
          "value_type": "llm_prompt",
          "description": "Caller's phone number",
          "dynamic_variable": "",
          "constant_value": "",
          "enum": null,
          "is_system_provided": false,
          "required": true
        },
        {
          "id": "caller_name",
          "type": "string",
          "value_type": "llm_prompt",
          "description": "Name provided by caller",
          "dynamic_variable": "",
          "constant_value": "",
          "enum": null,
          "is_system_provided": false,
          "required": false
        }
      ],
      "required": false,
      "value_type": "llm_prompt"
    },
    "request_headers": [
      {
        "type": "value",
        "name": "Content-Type",
        "value": "application/json"
      }
    ],
    "auth_connection": null
  },
  "response_timeout_secs": 30,
  "dynamic_variables": {
    "dynamic_variable_placeholders": {}
  }
}
```

---

## Tool 4: transfer_call

```json
{
  "type": "webhook",
  "name": "transfer_call",
  "description": "Transfer call to user's actual phone",
  "disable_interruptions": false,
  "force_pre_tool_speech": "auto",
  "assignments": [],
  "tool_call_sound": null,
  "tool_call_sound_behavior": "auto",
  "execution_mode": "immediate",
  "api_schema": {
    "url": "https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/transfer_call",
    "method": "POST",
    "path_params_schema": [],
    "query_params_schema": [],
    "request_body_schema": {
      "id": "body",
      "type": "object",
      "description": "Call transfer request",
      "properties": [
        {
          "id": "reason",
          "type": "string",
          "value_type": "llm_prompt",
          "description": "Reason for transfer",
          "dynamic_variable": "",
          "constant_value": "",
          "enum": null,
          "is_system_provided": false,
          "required": false
        }
      ],
      "required": false,
      "value_type": "llm_prompt"
    },
    "request_headers": [
      {
        "type": "value",
        "name": "Content-Type",
        "value": "application/json"
      }
    ],
    "auth_connection": null
  },
  "response_timeout_secs": 30,
  "dynamic_variables": {
    "dynamic_variable_placeholders": {}
  }
}
```

---

## Tool 5: log_call

```json
{
  "type": "webhook",
  "name": "log_call",
  "description": "Log call summary at end of conversation",
  "disable_interruptions": false,
  "force_pre_tool_speech": "auto",
  "assignments": [],
  "tool_call_sound": null,
  "tool_call_sound_behavior": "auto",
  "execution_mode": "immediate",
  "api_schema": {
    "url": "https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/log_call",
    "method": "POST",
    "path_params_schema": [],
    "query_params_schema": [],
    "request_body_schema": {
      "id": "body",
      "type": "object",
      "description": "Call logging request",
      "properties": [
        {
          "id": "intent",
          "type": "string",
          "value_type": "llm_prompt",
          "description": "Call intent (reservation, friend, sales, etc.)",
          "dynamic_variable": "",
          "constant_value": "",
          "enum": null,
          "is_system_provided": false,
          "required": false
        },
        {
          "id": "summary",
          "type": "string",
          "value_type": "llm_prompt",
          "description": "Brief summary of conversation",
          "dynamic_variable": "",
          "constant_value": "",
          "enum": null,
          "is_system_provided": false,
          "required": false
        },
        {
          "id": "action_taken",
          "type": "string",
          "value_type": "llm_prompt",
          "description": "Action taken (booked, transferred, etc.)",
          "dynamic_variable": "",
          "constant_value": "",
          "enum": null,
          "is_system_provided": false,
          "required": false
        }
      ],
      "required": false,
      "value_type": "llm_prompt"
    },
    "request_headers": [
      {
        "type": "value",
        "name": "Content-Type",
        "value": "application/json"
      }
    ],
    "auth_connection": null
  },
  "response_timeout_secs": 30,
  "dynamic_variables": {
    "dynamic_variable_placeholders": {}
  }
}
```

---

## Tool 6: block_scam

```json
{
  "type": "webhook",
  "name": "block_scam",
  "description": "Immediately terminate scam call and log report",
  "disable_interruptions": false,
  "force_pre_tool_speech": "auto",
  "assignments": [],
  "tool_call_sound": null,
  "tool_call_sound_behavior": "auto",
  "execution_mode": "immediate",
  "api_schema": {
    "url": "https://ai-gatekeeper-backend-i65wrni36q-uc.a.run.app/api/tools/block_scam",
    "method": "POST",
    "path_params_schema": [],
    "query_params_schema": [],
    "request_body_schema": {
      "id": "body",
      "type": "object",
      "description": "Scam blocking request",
      "properties": [
        {
          "id": "scam_type",
          "type": "string",
          "value_type": "llm_prompt",
          "description": "Type of scam detected (IRS, tech support, etc.)",
          "dynamic_variable": "",
          "constant_value": "",
          "enum": null,
          "is_system_provided": false,
          "required": false
        },
        {
          "id": "confidence",
          "type": "number",
          "value_type": "llm_prompt",
          "description": "Confidence score 0-1",
          "dynamic_variable": "",
          "constant_value": "",
          "enum": null,
          "is_system_provided": false,
          "required": false
        },
        {
          "id": "red_flags",
          "type": "array",
          "value_type": "llm_prompt",
          "description": "List of suspicious phrases detected",
          "dynamic_variable": "",
          "constant_value": "",
          "enum": null,
          "is_system_provided": false,
          "required": false,
          "items": {
            "type": "string"
          }
        }
      ],
      "required": false,
      "value_type": "llm_prompt"
    },
    "request_headers": [
      {
        "type": "value",
        "name": "Content-Type",
        "value": "application/json"
      }
    ],
    "auth_connection": null
  },
  "response_timeout_secs": 30,
  "dynamic_variables": {
    "dynamic_variable_placeholders": {}
  }
}
```

---

## How to Use:

1. In ElevenLabs dashboard, go to your "AI Gatekeeper" agent
2. Find the "Tools" section
3. Look for an option to "Import JSON" or "Add Tool" → "Advanced" → "JSON"
4. Copy and paste each JSON above, one at a time
5. Save each tool

If there's no JSON import option, you can manually create each tool using the values from the JSON.
