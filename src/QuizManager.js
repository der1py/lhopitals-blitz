import { QUIZ_STRUCTURE } from './Structures.js';
import { CONFIG } from './Game.js';

const QuizState = Object.freeze({
    INTRO: 'INTRO',
    QUIZ: 'QUIZ',
});

export class QuizManager {
    
    // one instance is created, and then init is called to start each quiz when needed
    constructor(obstacleManager, questionBank) {
        this.questionBank = questionBank
        this.obstacleManager = obstacleManager;
        this.active = false;
        this.completedQuestions = [];
        this.available = [];
    }

    // reset quiz stuff and start new quiz
    init() {
        this.active = true;
        this.state = QuizState.INTRO;
        this.q = this.nextQuestion();
        this.currentQuestion = this.q; // redundant but explicit so its ok
        this.correctLane = Math.floor(Math.random() * 4);
        this.obstacleManager.spawnScrollingText(6, this.q.text, 0);
    }

    // main update loop
    update() {
        if (!this.active) return;
        if (this.state === QuizState.INTRO && this.obstacleManager.obstacles.length === 0) {
            this.startQuiz();
        } else if (this.state === QuizState.QUIZ && this.obstacleManager.obstacles.length === 0) {
            this.active = false;
        }
    }

    // transitions from question to the actual quiz event
    startQuiz() {
        this.state = QuizState.QUIZ;
        this.obstacleManager.spawnStructure(QUIZ_STRUCTURE[this.correctLane]);

        const answers = [...this.q.options]; // shallow copy
        const correctAnswer = answers.shift(); // correct always at start
        const shuffled = answers.sort(() => Math.random() - 0.5); // randomize remaining answers

        for (let i = 0; i < 4; i++) {
            let ans;

            if (i === this.correctLane) {
                ans = correctAnswer;
            } else {
                ans = shuffled.pop();
            }

            this.obstacleManager.spawnScrollingText(i * 3 + 1, ans);
        }
    }

    // returns the next question from bank
    nextQuestion() {
        this.available = this.questionBank.filter(q => 
            !this.completedQuestions.includes(q)
        );
        if (this.available.length === 0) {
            this.completedQuestions = [];
            return this.nextQuestion();
        }

        let q = this.available[Math.floor(Math.random() * this.available.length)]
        this.currentQuestion = q; // yeah this might be a lil redundant but its fine for clarity
        return q;
    }

    markCurrentQuestionCompleted() {
        this.completedQuestions.push(this.currentQuestion);
    }

}