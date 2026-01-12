const { OpenRouter } = require("@openrouter/sdk");
const AIDietRecommendation = require("../models/AIDietRecommendation");
const AIDietPreference = require("../models/AIDietPreference");
const {
  calculateBMR,
  calculateTDEE,
  calculateMealBudgets,
  calculateMacroTargets,
} = require("../utils/macroScoring");

// Initialize OpenRouter client
const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "Exact Meal Design",
  },
});

exports.generateDietRecommendation = async (req, res) => {
  try {
    const userId = req.user._id;
    const preferences = req.body;

    // Validate required fields
    if (!preferences.healthGoals || preferences.healthGoals.length === 0) {
      return res.status(400).json({ message: "Health goals are required" });
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Helper function to send SSE messages
    const sendSSE = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Send initial status
    sendSSE("status", { message: "Connecting to AI...", progress: 0 });

    // Construct the prompt for Claude
    const prompt = `You are an expert nutritionist and diet planner. Create a personalized weekly meal plan based on the following user preferences:

Dietary Restrictions: ${preferences.dietaryRestrictions?.join(", ") || "None"}
Health Goals: ${preferences.healthGoals?.join(", ")}
Allergies: ${preferences.allergies?.join(", ") || "None"}
Preferred Cuisines: ${preferences.preferredCuisines?.join(", ") || "Any"}
Daily Calorie Target: ${preferences.calorieTarget || "Not specified"}
Meals Per Day: ${preferences.mealsPerDay || 3}
Activity Level: ${preferences.activityLevel || "moderate"}
Budget Range: ${preferences.budgetRange || "Medium"}
Additional Notes: ${preferences.additionalNotes || "None"}

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

    sendSSE("status", {
      message: "AI is generating your meal plan...",
      progress: 10,
    });

    // Call OpenRouter API with Xiaomi Mimo v2 Flash
    let stream;

    try {
      stream = await openrouter.chat.send({
        model: "xiaomi/mimo-v2-flash:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
        streamOptions: {
          includeUsage: true,
        },
      });

      console.log(`✅ Successfully connected to AI model: xiaomi/mimo-v2-flash:free`);
    } catch (apiError) {
      console.error("❌ OpenRouter API Error:", apiError);
      console.error("Error details:", JSON.stringify(apiError, null, 2));
      sendSSE("error", {
        message: "Failed to connect to AI model",
        error: apiError.message || "Unknown API error",
        details: apiError.toString(),
      });
      res.end();
      return;
    }

    // Collect the streamed response and send progress updates
    let responseText = "";
    let chunkCount = 0;
    const estimatedTotalChunks = 200; 

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        responseText += content;
        chunkCount++;

        // Send progress update every 10 chunks
        if (chunkCount % 10 === 0) {
          const progress = Math.min(
            10 + (chunkCount / estimatedTotalChunks) * 70,
            80
          );
          sendSSE("status", {
            message: "Generating meal plan...",
            progress: Math.round(progress),
            preview: responseText.substring(0, 100) + "...",
          });
        }

        // Send streaming content
        sendSSE("content", { chunk: content });
      }
    }

    sendSSE("status", { message: "Processing response...", progress: 85 });

    // Parse the JSON response
    let recommendation;
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = responseText.trim();
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, "");
      cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
      cleanedResponse = cleanedResponse.trim();

      // Parse the JSON
      recommendation = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw response:", responseText);
      sendSSE("error", {
        message: "Error parsing AI response. The AI did not return valid JSON.",
        error: parseError.message,
      });
      res.end();
      return;
    }

    sendSSE("status", { message: "Saving to database...", progress: 90 });

    // Save to database
    console.log(" SAVING TO MONGODB ");
    console.log("User ID:", userId);
    console.log("Preferences:", JSON.stringify(preferences, null, 2));
    console.log("Recommendation Summary:", recommendation.summary);
    console.log("Weekly Plan Days:", recommendation.weeklyPlan?.length);

    const aiDietRecommendation = await AIDietRecommendation.create({
      userId,
      preferences,
      recommendation,
    });

    console.log("✅ SUCCESSFULLY SAVED TO MONGODB");
    console.log("Document ID:", aiDietRecommendation._id);
    console.log("Document userId:", aiDietRecommendation.userId);
    console.log("Created At:", aiDietRecommendation.createdAt);
    console.log(
      "Full Document:",
      JSON.stringify(aiDietRecommendation, null, 2)
    );
  

    // Send final result
    sendSSE("complete", {
      success: true,
      data: aiDietRecommendation,
      progress: 100,
    });

    res.end();
  } catch (error) {
    console.error("Error generating diet recommendation:", error);

    // Send error via SSE if headers already sent, otherwise send JSON
    if (res.headersSent) {
      const sendSSE = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };
      sendSSE("error", {
        message: "Error generating diet recommendation",
        error: error.message,
      });
      res.end();
    } else {
      res.status(500).json({
        message: "Error generating diet recommendation",
        error: error.message,
      });
    }
  }
};

// @desc    Get user's diet recommendations
// @route   GET /api/ai-diet/my-recommendations
// @access  Private
exports.getMyRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, page = 1 } = req.query;

    console.log(
      "==================== FETCHING FROM MONGODB ===================="
    );
    console.log("Querying for userId:", userId);

    const recommendations = await AIDietRecommendation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AIDietRecommendation.countDocuments({ userId });

    console.log("Total recommendations found:", total);
    console.log("Recommendations returned:", recommendations.length);
    if (recommendations.length > 0) {
      console.log("First recommendation ID:", recommendations[0]._id);
      console.log(
        "First recommendation created:",
        recommendations[0].createdAt
      );
    }
    console.log(
      "==============================================================="
    );

    res.json({
      success: true,
      data: recommendations,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
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
      return res.status(404).json({ message: "Recommendation not found" });
    }

    // Check if user owns this recommendation
    if (recommendation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error("Error fetching recommendation:", error);
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
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const recommendation = await AIDietRecommendation.findById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ message: "Recommendation not found" });
    }

    // Check if user owns this recommendation
    if (recommendation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    recommendation.rating = rating;
    if (feedback) recommendation.feedback = feedback;
    await recommendation.save();

    res.json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error("Error rating recommendation:", error);
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
      return res.status(404).json({ message: "Recommendation not found" });
    }

    // Check if user owns this recommendation
    if (recommendation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await recommendation.deleteOne();

    res.json({
      success: true,
      message: "Recommendation deleted",
    });
  } catch (error) {
    console.error("Error deleting recommendation:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save/Update user's diet preferences (without generating AI recommendation)
// @route   POST /api/ai-diet/preferences
// @access  Private
exports.saveUserPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const preferences = req.body;

    // Find existing preferences or create new
    let userPreference = await AIDietPreference.findOne({ userId });

    if (userPreference) {
      // Update existing preferences
      Object.assign(userPreference, preferences);
      await userPreference.save();
    } else {
      // Create new preferences
      userPreference = await AIDietPreference.create({
        userId,
        ...preferences,
      });
    }

    res.json({
      success: true,
      message: "Preferences saved successfully",
      data: userPreference,
    });
  } catch (error) {
    console.error("Error saving user preferences:", error);
    res.status(500).json({
      success: false,
      message: "Error saving preferences",
      error: error.message,
    });
  }
};

// @desc    Get user's diet preferences with calculated BMR/TDEE
// @route   GET /api/ai-diet/preferences
// @access  Private
exports.getUserPreferences = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check for saved preferences first (most up-to-date)
    const savedPreference = await AIDietPreference.findOne({ userId });

    // Also get the most recent AI diet recommendation as fallback
    const latestRecommendation = await AIDietRecommendation.findOne({ userId })
      .sort({ createdAt: -1 })
      .limit(1);

    // Use saved preferences first, fallback to latest recommendation preferences
    const preferences = savedPreference || latestRecommendation?.preferences;

    if (!preferences) {
      return res.json({
        success: true,
        data: {
          hasPreferences: false,
          message:
            "No preferences found. Please complete your profile in the AI Diet section.",
        },
      });
    }

    // Check if we have minimum required data for BMR calculation
    const hasMinimumData =
      preferences.age &&
      preferences.weight &&
      preferences.height &&
      preferences.gender;

    if (!hasMinimumData) {
      return res.json({
        success: true,
        data: {
          hasPreferences: true,
          bmr: null,
          tdee: null,
          mealBudgets: null,
          dietaryRestrictions: preferences.dietaryRestrictions || [],
          allergies: preferences.allergies || [],
          healthGoals: preferences.healthGoals || [],
          macroTargets: null,
          mealsPerDay: preferences.mealsPerDay || 3,
          activityLevel: preferences.activityLevel || "moderate",
          calorieTarget: preferences.calorieTarget || null,
          warning:
            "Incomplete profile: age, weight, height, and gender required for personalized recommendations",
        },
      });
    }

    // Calculate BMR and TDEE
    const bmr = calculateBMR({
      age: preferences.age,
      weight: preferences.weight,
      height: preferences.height,
      gender: preferences.gender,
    });

    const tdee = calculateTDEE(bmr, preferences.activityLevel || "moderate");

    // Calculate meal budgets with custom distribution
    const mealBudgets = calculateMealBudgets(tdee);

    // Calculate macro targets based on health goals
    const macroTargets = calculateMacroTargets(
      tdee,
      preferences.healthGoals || []
    );

    // Validate TDEE range
    if (tdee && (tdee < 1200 || tdee > 5000)) {
      console.warn(`TDEE ${tdee} is outside normal range for user ${userId}`);
    }

    res.json({
      success: true,
      data: {
        hasPreferences: true,
        bmr,
        tdee,
        mealBudgets,
        dietaryRestrictions: preferences.dietaryRestrictions || [],
        allergies: preferences.allergies || [],
        healthGoals: preferences.healthGoals || [],
        macroTargets,
        mealsPerDay: preferences.mealsPerDay || 3,
        activityLevel: preferences.activityLevel || "moderate",
        calorieTarget: preferences.calorieTarget || tdee,
      },
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching preferences",
      error: error.message,
    });
  }
};
