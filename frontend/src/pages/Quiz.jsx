import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveQuizResult } from '../api';
import { useAuth } from '../context/AuthContext';
import { Brain, Star, ArrowRight, Award, Compass, Heart, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const QUESTIONS = [
  {
    id: 1,
    text: "Which subjects did you enjoy most in high school?",
    type: "choice",
    options: [
      { text: "Mathematics & Coding", score: { technical: 10, analytical: 8 } },
      { text: "Physics & Chemistry", score: { analytical: 10, creative: 4 } },
      { text: "Computer Science & Logic", score: { technical: 10, analytical: 6 } },
      { text: "English, Arts & Design", score: { creative: 10, communication: 8 } },
      { text: "Commerce & Economics", score: { business: 10, analytical: 6 } }
    ]
  },
  {
    id: 2,
    text: "How do you prefer solving complex problems?",
    type: "choice",
    options: [
      { text: "Writing code or building algorithms", score: { technical: 10, analytical: 6 } },
      { text: "Applying mathematical formulas & proofs", score: { analytical: 10 } },
      { text: "Brainstorming with a team to coordinate", score: { communication: 10, business: 6 } },
      { text: "Sketching layouts or designing interfaces", score: { creative: 10, technical: 4 } },
      { text: "Researching literature and data sets", score: { analytical: 8, communication: 6 } }
    ]
  },
  {
    id: 3,
    text: "What is your ideal workspace style?",
    type: "choice",
    options: [
      { text: "A dynamic tech startup (mostly remote)", score: { technical: 8, creative: 6 } },
      { text: "A high-tech lab or research institution", score: { analytical: 10 } },
      { text: "A fast-paced corporate dashboard room", score: { business: 10, communication: 6 } },
      { text: "A creative digital agency / design house", score: { creative: 10 } },
      { text: "An NGO or social enterprise in the field", score: { communication: 8, business: 6 } }
    ]
  },
  {
    id: 4,
    text: "Which of these technical trends excites you most?",
    type: "choice",
    options: [
      { text: "Artificial Intelligence & neural networks", score: { technical: 10, analytical: 8 } },
      { text: "Game engines, AR/VR and 3D graphics", score: { technical: 8, creative: 8 } },
      { text: "Blockchain, trading tools & micro-finances", score: { business: 10, analytical: 8 } },
      { text: "Web apps, UI frameworks & mobile tools", score: { technical: 10, creative: 6 } },
      { text: "Robotics, automation and drone tech", score: { analytical: 8, technical: 8 } }
    ]
  },
  {
    id: 5,
    text: "How would you describe your role in a group project?",
    type: "choice",
    options: [
      { text: "The coder/engineer (I write the technical core)", score: { technical: 10 } },
      { text: "The researcher (I gather and analyze details)", score: { analytical: 10 } },
      { text: "The leader (I organize schedules and pitch)", score: { communication: 10, business: 8 } },
      { text: "The designer (I create visuals & layouts)", score: { creative: 10 } }
    ]
  },
  {
    id: 6,
    text: "Rate your interest in software programming & coding:",
    type: "rating"
  },
  {
    id: 7,
    text: "Rate your interest in mathematical equations & logic:",
    type: "rating"
  },
  {
    id: 8,
    text: "Rate your interest in creative writing & visual art:",
    type: "rating"
  },
  {
    id: 9,
    text: "What is your primary long-term career ambition?",
    type: "choice",
    options: [
      { text: "Building a high-impact SaaS startup", score: { business: 10, technical: 6 } },
      { text: "Landing a senior developer/architect role", score: { technical: 10, analytical: 6 } },
      { text: "Publishing scientific papers/innovations", score: { analytical: 10 } },
      { text: "Designing world-class user experiences", score: { creative: 10, communication: 6 } }
    ]
  },
  {
    id: 10,
    text: "Select your preferred course stream:",
    type: "choice",
    options: [
      { text: "Engineering & Technology (CSE, ECE, IT)", score: { technical: 10, analytical: 6 } },
      { text: "Artificial Intelligence & Data Science", score: { technical: 10, analytical: 10 } },
      { text: "Business Management (BBA, MBA path)", score: { business: 10, communication: 8 } },
      { text: "Pure Sciences / Mathematics Research", score: { analytical: 10 } },
      { text: "Creative Arts / UI UX Design", score: { creative: 10, technical: 4 } }
    ]
  }
];

const Quiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');


  const handleChoiceSelect = (choiceOption) => {
    const newAnswers = { ...answers, [currentStep]: choiceOption.score };
    setAnswers(newAnswers);
    advanceStep(newAnswers);
  };

  const handleRatingSelect = (ratingValue) => {
    const mappedScore = currentStep === 5 
      ? { technical: ratingValue * 2 }
      : currentStep === 6 
      ? { analytical: ratingValue * 2 }
      : { creative: ratingValue * 2 };
    
    const newAnswers = { ...answers, [currentStep]: mappedScore };
    setAnswers(newAnswers);
    advanceStep(newAnswers);
  };

  const advanceStep = (currentAnswers) => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      calculateAndSaveResults(currentAnswers);
    }
  };

  const calculateAndSaveResults = async (finalAnswers) => {
    setLoading(true);
    setError('');

    const scores = { technical: 0, analytical: 0, creative: 0, business: 0, communication: 0 };
    Object.values(finalAnswers).forEach(ans => {
      Object.keys(ans).forEach(key => { scores[key] = (scores[key] || 0) + ans[key]; });
    });

    let career_path = 'Software Engineer';
    let personality = 'Analytical Architect';
    let maxScoreKey = 'technical';
    let maxScore = 0;

    Object.keys(scores).forEach(key => {
      if (scores[key] > maxScore) { maxScore = scores[key]; maxScoreKey = key; }
    });

    if (maxScoreKey === 'technical') { career_path = 'Artificial Intelligence & Software Engineer'; personality = 'Innovative Solution Builder'; }
    else if (maxScoreKey === 'analytical') { career_path = 'Data Scientist & Computational Researcher'; personality = 'Methodical Analyst'; }
    else if (maxScoreKey === 'creative') { career_path = 'UI/UX Designer & Product Specialist'; personality = 'Visual Catalyst'; }
    else if (maxScoreKey === 'business') { career_path = 'Product Manager & Entrepreneur'; personality = 'Strategic Planner'; }
    else if (maxScoreKey === 'communication') { career_path = 'Technical Consultant & Solutions Manager'; personality = 'Collaborative Communicator'; }

    const rawAptitude = (scores.technical + scores.analytical) * 1.5;
    const aptitude_score = Math.min(Math.max(Math.round(rawAptitude), 40), 100);

    const recommendations = `Based on your quiz profile, you excel at ${career_path.toLowerCase()} roles. Your aptitude score of ${aptitude_score}/100 puts you in a strong position for technical degrees. Recommended courses: CSE, AI & Data Science, IT. Top colleges on InfoHub offer scholarships for students with your profile!`;

    const payload = {
      career_path,
      personality,
      aptitude_score,
      interest_mapping: JSON.stringify({
        Technical: Math.min(scores.technical * 3, 100),
        Analytical: Math.min(scores.analytical * 3, 100),
        Creative: Math.min(scores.creative * 3, 100),
        Business: Math.min(scores.business * 3, 100),
      }),
      skills_analysis: JSON.stringify({
        'Problem Solving': Math.min(aptitude_score, 100),
        'Programming Logic': Math.min(scores.technical * 3, 100),
        'Product Design': Math.min(scores.creative * 3.5, 100),
        'Strategic Vision': Math.min(scores.business * 3.5, 100),
      }),
      recommendations,
    };

    try {
      if (user?.id) await saveQuizResult(user.id, payload);
      setResult({
        career_path,
        personality,
        aptitude_score,
        recommendations,
        interest_mapping: { Technical: Math.min(scores.technical * 3, 100), Analytical: Math.min(scores.analytical * 3, 100), Creative: Math.min(scores.creative * 3, 100), Business: Math.min(scores.business * 3, 100) },
        skills_analysis: { 'Problem Solving': Math.min(aptitude_score, 100), 'Programming Logic': Math.min(scores.technical * 3, 100), 'Product Design': Math.min(scores.creative * 3.5, 100), 'Strategic Vision': Math.min(scores.business * 3.5, 100) },
      });
    } catch (err) {
      setError(err.message || 'Error processing quiz results.');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = QUESTIONS[currentStep];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="quiz-question"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="card-premium p-8 md:p-12 relative overflow-hidden"
            >
              {/* Progress bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                  style={{ width: `${((currentStep) / QUESTIONS.length) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2 text-primary">
                  <Brain className="w-6 h-6 animate-pulse" />
                  <span className="font-semibold text-xs tracking-wider uppercase">Career Quiz</span>
                </div>
                <span className="text-xs text-textSecondaryDark font-mono">
                  Step {currentStep + 1} of {QUESTIONS.length}
                </span>
              </div>

              {loading ? (
                <div className="text-center py-12 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-textSecondaryDark text-sm">Evaluating your profile and mapping career recommendations...</p>
                </div>
              ) : (
                <div>
                  <h2 className="font-heading text-xl md:text-2xl font-bold text-slate-800 mb-8">
                    {currentQuestion.text}
                  </h2>

                  {currentQuestion.type === "choice" ? (
                    <div className="space-y-4">
                      {currentQuestion.options.map((opt, index) => (
                        <button
                          key={index}
                          onClick={() => handleChoiceSelect(opt)}
                          className="w-full text-left card-premium p-4 md:p-5 flex items-center justify-between group hover:border-primary/50 hover:bg-slate-50 transition-all duration-300"
                        >
                          <span className="text-sm font-medium text-textSecondaryDark group-hover:text-primary transition-colors">
                            {opt.text}
                          </span>
                          <ArrowRight className="w-4 h-4 text-textSecondaryDark group-hover:text-primary transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-8">
                      <div className="flex items-center gap-3">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            key={starVal}
                            onClick={() => handleRatingSelect(starVal)}
                            className="p-3 text-textSecondaryDark hover:text-amber-400 hover:scale-125 transition-all"
                          >
                            <Star className="w-10 h-10 fill-current" />
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-textSecondaryDark mt-6 font-mono">Select a rating from 1 (low) to 5 (high)</p>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm text-center">
                  {error}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="quiz-results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-premium p-8 md:p-12"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30 text-accent mb-4">
                  <Award className="w-8 h-8" />
                </div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-800">Assessment Complete</h2>
                <p className="text-textSecondaryDark text-sm mt-1">Your AI-generated guidance report is ready</p>
              </div>

              {/* Scorecard grids */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Career Map Card */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-2">
                      <Compass className="w-4 h-4" /> Career Path
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{result.career_path}</h3>
                    <p className="text-xs text-textSecondaryDark font-mono">Archetype: {result.personality}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs text-textSecondaryDark">Aptitude Score</span>
                    <span className="text-lg font-mono font-bold text-accent">{result.aptitude_score}/100</span>
                  </div>
                </div>

                {/* Interest Map */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-secondary text-xs font-bold uppercase tracking-wider mb-4">
                    <Heart className="w-4 h-4" /> Interest Map
                  </div>
                  <div className="space-y-3">
                    {Object.entries(result.interest_mapping).map(([label, val]) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-textSecondaryDark font-medium">{label}</span>
                          <span className="text-slate-800 font-semibold">{val}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-secondary rounded-full" style={{ width: `${val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 mb-8">
                <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                  <Layers className="w-4 h-4" /> Skills analysis
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(result.skills_analysis).map(([skill, val]) => (
                    <div key={skill} className="flex flex-col gap-1.5">
                      <span className="text-xs text-textSecondaryDark font-semibold">{skill}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${val}%` }} />
                        </div>
                        <span className="text-xs text-slate-800 font-mono font-bold">{val}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Guidance text */}
              <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 mb-8">
                <h4 className="text-sm font-bold text-slate-800 mb-2">🤖 AI Recommendations Summary</h4>
                <p className="text-xs text-textSecondaryDark leading-relaxed whitespace-pre-line">
                  {result.recommendations}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/student/dashboard')}
                  className="btn-primary flex-1 text-center py-3"
                >
                  Go to Recommendations
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setCurrentStep(0);
                    setAnswers({});
                  }}
                  className="btn-secondary px-6"
                >
                  Retake Test
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Quiz;
