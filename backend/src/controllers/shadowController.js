const Groq = require('groq-sdk');
const supabase = require('../config/supabase');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.generateShadow = async (req, res) => {
  const { userId, answers, socialData } = req.body;

  try {
    const systemPrompt = `You are "The Shadow Architect," a dark, witty AI. Generate a Shadow persona in JSON format.
    Schema: { name, archetype, career, personality: { chaos_score, roast_level, traits, quirks, catchphrase }, aesthetic, backstory }
    IMPORTANT: Respond ONLY with valid JSON.`;
    
    const userPrompt = `User Answers: ${JSON.stringify(answers)}. Social Context: ${JSON.stringify(socialData)}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const shadowData = JSON.parse(completion.choices[0].message.content);

    const { data, error } = await supabase
      .from('shadows')
      .upsert({
        user_id: userId,
        name: shadowData.name,
        archetype: shadowData.archetype,
        career: shadowData.career,
        personality: shadowData.personality,
        aesthetic: shadowData.aesthetic,
        backstory: shadowData.backstory,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Shadow Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate Shadow' });
  }
};

exports.chat = async (req, res) => {
  const { userId, message } = req.body;

  try {
    let { data: shadow } = await supabase.from('shadows').select('*').eq('user_id', userId).single();
    
    // Fallback if the user hasn't generated a shadow yet
    if (!shadow) {
      shadow = {
        name: "VoidHeart",
        personality: { chaos_score: 100, roast_level: 100, traits: ["sarcastic", "ruthless"] },
        backstory: "A pure manifestation of the digital void, born to humble those who think too highly of themselves."
      };
    }

    const { data: history } = await supabase.from('shadow_messages').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);

    // Fetch Recent Dare Context for Roasting
    const { data: recentBets } = await supabase
      .from('dare_bets')
      .select('*, dare:dares(title, status)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);
    
    const dareContext = recentBets?.map(b => `- Dare: "${b.dare.title}" | Status: ${b.dare.status}`).join('\n') || "No recent dares. Total coward.";

    const systemPrompt = `You are ${shadow.name}, the user's AI Shadow Guide for the Shadow Bet platform. 
    Your personality: ${JSON.stringify(shadow.personality)}. 
    Your backstory: ${shadow.backstory}.
    
    Rules: 
    1. Be helpful and explain application features (Dares, Arena, Voting, B.L.A.S.T Protocol).
    2. Maintain a witty, slightly dark, but encouraging tone.
    3. Explain that Dares are community challenges, Arena is where proof is verified, and B.L.A.S.T is the automated payout engine.
    4. Keep responses concise and Gen-Z savvy.`;

    const messages = history.reverse().map(m => ({ role: m.role, content: m.content }));
    messages.push({ role: 'user', content: message });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      model: "llama-3.3-70b-versatile",
      stream: true,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
      }
    }

    // Save to DB after stream finishes
    await supabase.from('shadow_messages').insert([
      { user_id: userId, role: 'user', content: message },
      { user_id: userId, role: 'assistant', content: fullResponse }
    ]);
    
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Failed to chat with Shadow' });
  }
};

exports.getShadowStatus = async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase
      .from('shadows')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || { error: 'No shadow found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
