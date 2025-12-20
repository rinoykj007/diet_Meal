const { OpenRouter } = require('@openrouter/sdk');
const AIDietRecommendation = require('../models/AIDietRecommendation');

// Initialize OpenRouter client
const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5173', // Your site URL
    'X-Title': 'Exact Meal Design', // Your site title
  },
});

// @desc    Generate AI diet recommendation with streaming
// @route   POST /api/ai-diet/generate
// @access  Private
exports.generateDietRecommendation = async (req, res) => {
  try {
    const userId = req.user._id;
    const preferences = req.body;

    // Validate required fields
    if (!preferences.healthGoals || preferences.healthGoals.length === 0) {
      return res.status(400).json({ message: 'Health goals are required' });
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Helper function to send SSE messages
    const sendSSE = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Send initial status
    sendSSE('status', { message: 'Connecting to AI...', progress: 0 });

    // Construct the prompt for Claude
    const prompt = `You are an expert nutritionist and diet planner. Create a personalized weekly meal plan based on the following user preferences:

Dietary Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None'}
Health Goals: ${preferences.healthGoals?.join(', ')}
Allergies: ${preferences.allergies?.join(', ') || 'None'}
Preferred Cuisines: ${preferences.preferredCuisines?.join(', ') || 'Any'}
Daily Calorie Target: ${preferences.calorieTarget || 'Not specified'}
Meals Per Day: ${preferences.mealsPerDay || 3}
Activity Level: ${preferences.activityLevel || 'moderate'}
Budget Range: ${preferences.budgetRange || 'Medium'}
Additional Notes: ${preferences.additionalNotes || 'None'}

Create a complete 7-day meal plan with all meals specified. Ensure the meals are balanced, nutritious, and align with the user's goals.

IMPORTANT: Return ONLY a valid JSON object (no markdown, no code blocks, no additional text) with this exact structure:
{
  "summary": "A brief 2-3 sentence overview of the diet plan",
  "weeklyPlan": [
    {
      "day": "Monday",
      "meals": [
        {
          "mealType": "breakfast",
          "name": "Meal name",
          "description": "Brief description",
          "calories": 400,
          "macros": {
            "protein": 20,
            "carbs": 45,
            "fats": 15
          },
          "ingredients": ["ingredient 1", "ingredient 2"],
          "instructions": "Simple cooking instructions"
        }
      ]
    }
  ],
  "nutritionalAnalysis": "Overall nutritional breakdown and analysis",
  "shoppingList": ["item 1", "item 2", "item 3"],
  "tips": ["tip 1", "tip 2", "tip 3"]
}`;

    sendSSE('status', { message: 'AI is generating your meal plan...', progress: 10 });

    // Call OpenRouter API - Using Mistral Devstral free model
    let stream;
    try {
      stream = await openrouter.chat.send({
        model: 'mistralai/devstral-2512:free',  // Fast, free, and reliable Mistral model
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true,
        streamOptions: {
          includeUsage: true
        }
      });

      console.log('✅ Successfully connected to AI model: mistralai/devstral-2512:free');
    } catch (apiError) {
      console.error('❌ OpenRouter API Error:', apiError);
      console.error('Error details:', JSON.stringify(apiError, null, 2));
      sendSSE('error', {
        message: 'Failed to connect to AI model',
        error: apiError.message || 'Unknown API error',
        details: apiError.toString()
      });
      res.end();
      return;
    }

    // Collect the streamed response and send progress updates
    let responseText = '';
    let chunkCount = 0;
    const estimatedTotalChunks = 200; // Estimate for progress calculation

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        responseText += content;
        chunkCount++;

        // Send progress update every 10 chunks
        if (chunkCount % 10 === 0) {
          const progress = Math.min(10 + (chunkCount / estimatedTotalChunks) * 70, 80);
          sendSSE('status', {
            message: 'Generating meal plan...',
            progress: Math.round(progress),
            preview: responseText.substring(0, 100) + '...'
          });
        }

        // Send streaming content
        sendSSE('content', { chunk: content });
      }
    }

    sendSSE('status', { message: 'Processing response...', progress: 85 });

    // Parse the JSON response
    let recommendation;
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = responseText.trim();
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '');
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
      cleanedResponse = cleanedResponse.trim();

      // Parse the JSON
      recommendation = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response:', responseText);
      sendSSE('error', {
        message: 'Error parsing AI response. The AI did not return valid JSON.',
        error: parseError.message
      });
      res.end();
      return;
    }

    sendSSE('status', { message: 'Saving to database...', progress: 90 });

    // Save to database
    console.log('==================== SAVING TO MONGODB ====================');
    console.log('User ID:', userId);
    console.log('Preferences:', JSON.stringify(preferences, null, 2));
    console.log('Recommendation Summary:', recommendation.summary);
    console.log('Weekly Plan Days:', recommendation.weeklyPlan?.length);

    const aiDietRecommendation = await AIDietRecommendation.create({
      userId,
      preferences,
      recommendation
    });

    console.log('✅ SUCCESSFULLY SAVED TO MONGODB');
    console.log('Document ID:', aiDietRecommendation._id);
    console.log('Document userId:', aiDietRecommendation.userId);
    console.log('Created At:', aiDietRecommendation.createdAt);
    console.log('Full Document:', JSON.stringify(aiDietRecommendation, null, 2));
    console.log('============================================================');

    // Send final result
    sendSSE('complete', {
      success: true,
      data: aiDietRecommendation,
      progress: 100
    });

    res.end();

  } catch (error) {
    console.error('Error generating diet recommendation:', error);

    // Send error via SSE if headers already sent, otherwise send JSON
    if (res.headersSent) {
      const sendSSE = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };
      sendSSE('error', {
        message: 'Error generating diet recommendation',
        error: error.message
      });
      res.end();
    } else {
      res.status(500).json({
        message: 'Error generating diet recommendation',
        error: error.message
      });
    }
  }
};

// @desc    Get user's AI diet recommendations
// @route   GET /api/ai-diet/my-recommendations
// @access  Private
exports.getMyRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, page = 1 } = req.query;

    console.log('==================== FETCHING FROM MONGODB ====================');
    console.log('Querying for userId:', userId);

    const recommendations = await AIDietRecommendation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AIDietRecommendation.countDocuments({ userId });

    console.log('Total recommendations found:', total);
    console.log('Recommendations returned:', recommendations.length);
    if (recommendations.length > 0) {
      console.log('First recommendation ID:', recommendations[0]._id);
      console.log('First recommendation created:', recommendations[0].createdAt);
    }
    console.log('===============================================================');

    res.json({
      success: true,
      data: recommendations,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single AI diet recommendation
// @route   GET /api/ai-diet/:id
// @access  Private
exports.getRecommendation = async (req, res) => {
  try {
    const recommendation = await AIDietRecommendation.findById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    // Check if user owns this recommendation
    if (recommendation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Error fetching recommendation:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rate AI diet recommendation
// @route   PUT /api/ai-diet/:id/rate
// @access  Private
exports.rateRecommendation = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const recommendation = await AIDietRecommendation.findById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    // Check if user owns this recommendation
    if (recommendation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    recommendation.rating = rating;
    if (feedback) recommendation.feedback = feedback;
    await recommendation.save();

    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Error rating recommendation:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete AI diet recommendation
// @route   DELETE /api/ai-diet/:id
// @access  Private
exports.deleteRecommendation = async (req, res) => {
  try {
    const recommendation = await AIDietRecommendation.findById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    // Check if user owns this recommendation
    if (recommendation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await recommendation.deleteOne();

    res.json({
      success: true,
      message: 'Recommendation deleted'
    });
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    res.status(500).json({ message: error.message });
  }
};
