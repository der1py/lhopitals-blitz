import { QUIZ_STRUCTURE } from './Structures.js';
import { QUESTION_BANK } from './QuestionBank.js';
import { CONFIG } from './Game.js';

const QuizState = Object.freeze({
    INTRO: 'INTRO',
    QUIZ: 'QUIZ',
});

export class QuizManager {
    
    constructor(obstacleManager) {
        this.obstacleManager = obstacleManager;
        this.active = false;
        this.completedQuestions = [];
        this.available = [];
    }


    // reset quiz stuff
    init() {
        this.active = true;
        this.state = QuizState.INTRO;
        this.q = this.nextQuestion();
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
        this.available = QUESTION_BANK.filter(q => 
            !this.completedQuestions.includes(q)
        );
        if (this.available.length === 0) {
            this.completedQuestions = [];
            return this.nextQuestion();
        }

        let q = this.available[Math.floor(Math.random() * this.available.length)]
        this.completedQuestions.push(q);
        return q;
    }

}