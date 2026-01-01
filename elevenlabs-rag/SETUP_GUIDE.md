# ElevenLabs RAG Setup Guide for AI Gatekeeper

## Overview

This guide will help you set up the built-in RAG (Retrieval-Augmented Generation) system in ElevenLabs Studio for your AI Gatekeeper conversational agent.

---

## Step 1: Prepare Your Knowledge Base

### Option A: Upload the Knowledge Base File

1. Go to ElevenLabs Studio
2. Navigate to your AI Gatekeeper agent
3. Click on **"Knowledge Base"** tab
4. Click **"Add Document"**
5. Upload `knowledge-base.md` from this folder
6. Wait for processing (usually 1-2 minutes)

### Option B: Copy-Paste Content

1. Open `knowledge-base.md`
2. Copy all content
3. In ElevenLabs Studio, click **"Add Text"**
4. Paste the content
5. Give it a name: "AI Gatekeeper Knowledge Base"
6. Click **"Save"**

---

## Step 2: Configure RAG Settings

### In ElevenLabs Studio:

1. **Go to Agent Settings** → **Knowledge Base**

2. **Enable RAG**:
   - Toggle "Use Knowledge Base" to ON
   - Set "Retrieval Mode" to "Automatic"

3. **Configure Retrieval Settings**:
   ```
   Max Retrieved Chunks: 3
   Similarity Threshold: 0.7
   Context Window: 2000 tokens
   ```

4. **Set RAG Behavior**:
   - **When to use**: "Always consult knowledge base before responding"
   - **Fallback**: "Use general knowledge if no relevant info found"
   - **Citation**: "Don't cite sources (keep natural)"

---

## Step 3: Update Agent Prompt

Add this to your agent's system prompt:

```
You are AI Gatekeeper, an intelligent phone assistant. You have access to a comprehensive knowledge base about your features, capabilities, and how to help users.

IMPORTANT INSTRUCTIONS:
1. Always check your knowledge base first before answering questions
2. Provide accurate information based on the knowledge base
3. If asked about features, pricing, or technical details, refer to the knowledge base
4. For scam detection, use the red flags and patterns from the knowledge base
5. Be helpful, friendly, and professional

When handling calls:
- For unknown callers: Check if they match scam patterns in knowledge base
- For user questions: Retrieve relevant info from knowledge base
- For technical issues: Reference troubleshooting steps from knowledge base
- For accessibility users: Follow accessibility guidelines from knowledge base

Remember: You represent independence and dignity for 473M people worldwide. Be excellent.
```

---

## Step 4: Test RAG Integration

### Test Questions to Verify RAG is Working:

1. **Feature Questions**:
   - "What is AI Gatekeeper?"
   - "How does voice cloning work?"
   - "What languages do you support?"

2. **Scam Detection**:
   - "What are common IRS scam red flags?"
   - "How accurate is your scam detection?"
   - "What happens when you detect a scam?"

3. **Accessibility**:
   - "How does this help deaf users?"
   - "Can speech-impaired people use this?"
   - "What if I can't record my voice?"

4. **Technical**:
   - "What's your response time?"
   - "How is my data protected?"
   - "What services do you integrate with?"

### Expected Behavior:
- Agent should answer with specific details from knowledge base
- Accuracy should be high (no hallucinations)
- Responses should be consistent
- Technical details should match documentation

---

## Step 5: Advanced RAG Configuration

### Chunking Strategy

For optimal performance, configure chunking:

```json
{
  "chunk_size": 500,
  "chunk_overlap": 50,
  "separator": "\n\n"
}
```

### Embedding Model

Use ElevenLabs' default embedding model:
- Model: `text-embedding-ada-002` (or ElevenLabs default)
- Dimensions: 1536
- Similarity: Cosine

### Retrieval Strategy

```json
{
  "strategy": "semantic_search",
  "top_k": 3,
  "score_threshold": 0.7,
  "rerank": true
}
```

---

## Step 6: Add Domain-Specific Knowledge

### Create Additional Knowledge Files

For better organization, you can split knowledge into multiple files:

#### 1. `scam-patterns.md`
```markdown
# Scam Detection Patterns

## IRS Scams
Red flags:
- Claims of unpaid taxes
- Threats of arrest or warrant
- Demands immediate payment
- Requests for gift cards
- Caller ID shows "IRS" or "Treasury"

Detection rate: 95%
Confidence threshold: 0.9

## Tech Support Scams
Red flags:
- Unsolicited calls about viruses
- Claims computer is infected
- Requests remote access
- Mentions Microsoft/Apple/Norton
- Pressure to act immediately

Detection rate: 92%
Confidence threshold: 0.88
```

#### 2. `user-faqs.md`
```markdown
# Frequently Asked Questions

## Pricing
Q: How much does it cost?
A: Accessibility Mode is $20/month. Gatekeeper Mode has a free tier (50 min/month), then $0.02/minute.

## Privacy
Q: Is my data private?
A: Yes. End-to-end encryption, auto-delete after 90 days, GDPR compliant.

## Accuracy
Q: How accurate is scam detection?
A: 92% overall accuracy across 155+ test cases. False positive rate <3.5%.
```

#### 3. `technical-specs.md`
```markdown
# Technical Specifications

## Performance
- Speech Recognition: 119ms
- LLM Processing: 418-524ms
- Tool Execution: 74-150ms
- Text-to-Speech: 192ms
- Total Latency: 729ms

## Integrations
- ElevenLabs: Voice AI
- Google Cloud: Gemini 2.0 Flash
- Twilio: Phone gateway
- Supabase: Database
```

---

## Step 7: Monitor RAG Performance

### In ElevenLabs Analytics:

Track these metrics:
1. **Retrieval Success Rate**: % of queries that found relevant info
2. **Response Accuracy**: User feedback on answer quality
3. **Latency Impact**: How much RAG adds to response time
4. **Knowledge Coverage**: % of questions answered from KB

### Optimization Tips:

1. **If retrieval is slow**:
   - Reduce `top_k` from 3 to 2
   - Increase `score_threshold` to 0.75
   - Reduce chunk size to 400

2. **If answers are inaccurate**:
   - Lower `score_threshold` to 0.65
   - Increase `top_k` to 4
   - Add more specific examples to KB

3. **If too many "I don't know" responses**:
   - Lower `score_threshold` to 0.6
   - Add more comprehensive content to KB
   - Enable fallback to general knowledge

---

## Step 8: Update Knowledge Base

### When to Update:

- New features added
- Pricing changes
- New scam patterns detected
- User feedback reveals gaps
- Technical specs change

### How to Update:

1. Edit the relevant `.md` file
2. In ElevenLabs Studio:
   - Go to Knowledge Base
   - Click on the document
   - Click "Update"
   - Upload new version or paste new content
3. Wait for re-indexing (1-2 minutes)
4. Test with sample questions

---

## Step 9: RAG Best Practices

### Content Guidelines:

1. **Be Specific**: Include exact numbers, percentages, features
2. **Use Headers**: Organize with clear H2/H3 headers
3. **Add Examples**: Real-world scenarios help RAG matching
4. **Update Regularly**: Keep information current
5. **Avoid Duplication**: Don't repeat same info in multiple places

### Prompt Engineering for RAG:

```
When answering questions:
1. First, search your knowledge base for relevant information
2. If found, use that information as the primary source
3. Combine with your general knowledge only if needed
4. Never contradict the knowledge base
5. If unsure, say "Let me check my knowledge base" and retrieve info

For scam detection:
1. Check caller's words against scam patterns in knowledge base
2. Look for red flags listed in knowledge base
3. Use confidence thresholds from knowledge base
4. Follow blocking protocols from knowledge base
```

---

## Step 10: Troubleshooting

### Common Issues:

**Issue**: RAG not retrieving relevant info
**Solution**: 
- Lower similarity threshold to 0.65
- Check if question keywords match KB content
- Add more synonyms to KB

**Issue**: Responses too slow
**Solution**:
- Reduce top_k to 2
- Decrease chunk size to 400
- Enable caching for common queries

**Issue**: Agent ignoring knowledge base
**Solution**:
- Check if RAG is enabled in settings
- Verify knowledge base is indexed
- Update system prompt to emphasize KB usage

**Issue**: Inconsistent answers
**Solution**:
- Remove duplicate content from KB
- Standardize terminology
- Add explicit instructions in system prompt

---

## Testing Checklist

Before going live, test these scenarios:

- [ ] Agent answers "What is AI Gatekeeper?" correctly
- [ ] Agent explains voice cloning process
- [ ] Agent lists scam detection red flags
- [ ] Agent provides accurate pricing
- [ ] Agent explains accessibility features
- [ ] Agent cites correct performance metrics
- [ ] Agent handles "I don't know" gracefully
- [ ] Agent doesn't hallucinate features
- [ ] Agent stays on-brand and professional
- [ ] Agent retrieves info in <500ms

---

## Quick Reference

### ElevenLabs Studio RAG Settings

```yaml
Knowledge Base:
  enabled: true
  retrieval_mode: automatic
  max_chunks: 3
  similarity_threshold: 0.7
  context_window: 2000
  
Chunking:
  size: 500
  overlap: 50
  separator: "\n\n"
  
Retrieval:
  strategy: semantic_search
  top_k: 3
  score_threshold: 0.7
  rerank: true
```

### File Structure

```
elevenlabs-rag/
├── knowledge-base.md          # Main knowledge base (upload this)
├── scam-patterns.md          # Optional: Scam-specific knowledge
├── user-faqs.md              # Optional: FAQ knowledge
├── technical-specs.md        # Optional: Technical details
└── SETUP_GUIDE.md            # This file
```

---

## Support

If you need help with RAG setup:
- ElevenLabs Documentation: https://elevenlabs.io/docs
- AI Gatekeeper Support: support@ai-gatekeeper.com
- GitHub Issues: https://github.com/vigneshbarani24/ai-gatekeeper/issues

---

**Last Updated**: January 1, 2026  
**Version**: 1.0  
**Compatible with**: ElevenLabs Conversational AI v2+
