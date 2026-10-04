/* ==========================================
   تعلم الجمع للأطفال
   5 مستويات متسلسلة
========================================== */


const TOTAL_QUESTIONS = 10;


/*
   المستوى:
   1 = رقم واحد
   2 = رقمان
   3 = ثلاثة أرقام
   4 = أربعة أرقام
   5 = خمسة أرقام
*/

const levelDigits = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5
};


let currentLevel = 1;
let currentQuestion = 1;

let score = 0;

let numberA = 0;
let numberB = 0;

let answered = false;


/* ==========================================
   العناصر
========================================== */

const numberAElement =
    document.getElementById("numberA");

const numberBElement =
    document.getElementById("numberB");

const answerElement =
    document.getElementById("answer");

const checkAnswerButton =
    document.getElementById("checkAnswer");

const nextQuestionButton =
    document.getElementById("nextQuestion");

const messageElement =
    document.getElementById("message");

const levelNumberElement =
    document.getElementById("levelNumber");

const questionNumberElement =
    document.getElementById("questionNumber");

const scoreElement =
    document.getElementById("score");

const completeElement =
    document.getElementById("complete");

const completeTextElement =
    document.getElementById("completeText");

const nextLevelButton =
    document.getElementById("nextLevel");

const additionCard =
    document.getElementById("additionCard");


/* ==========================================
   المستوى المفتوح
========================================== */

function getUnlockedLevel() {

    let saved =
        localStorage.getItem(
            "additionUnlockedLevel"
        );

    if (!saved) {

        localStorage.setItem(
            "additionUnlockedLevel",
            "1"
        );

        return 1;
    }

    let level =
        parseInt(saved);

    if (
        isNaN(level) ||
        level < 1
    ) {

        level = 1;
    }

    if (level > 5) {
        level = 5;
    }

    return level;
}


/* ==========================================
   فتح المستوى التالي
========================================== */

function unlockNextLevel() {

    if (currentLevel >= 5) {
        return;
    }

    const nextLevel =
        currentLevel + 1;

    localStorage.setItem(
        "additionUnlockedLevel",
        nextLevel.toString()
    );
}


/* ==========================================
   إنشاء رقم حسب عدد الخانات
========================================== */

function generateNumber(digits) {

    if (digits === 1) {

        return Math.floor(
            Math.random() * 9
        ) + 1;
    }


    const minimum =
        Math.pow(10, digits - 1);

    const maximum =
        Math.pow(10, digits) - 1;


    return Math.floor(
        Math.random() *
        (maximum - minimum + 1)
    ) + minimum;
}


/* ==========================================
   إنشاء عملية جديدة
========================================== */

function createQuestion() {

    const digits =
        levelDigits[currentLevel];


    numberA =
        generateNumber(digits);

    numberB =
        generateNumber(digits);


    numberAElement.textContent =
        numberA;

    numberBElement.textContent =
        numberB;


    levelNumberElement.textContent =
        currentLevel;

    questionNumberElement.textContent =
        currentQuestion;


    answerElement.value = "";

    answerElement.disabled = false;

    checkAnswerButton.disabled = false;

    messageElement.textContent = "";

    messageElement.className =
        "message";


    nextQuestionButton.style.display =
        "none";


    answered = false;


    answerElement.focus();
}


/* ==========================================
   التحقق من الإجابة
========================================== */

function checkAnswer() {

    if (answered) {
        return;
    }


    const value =
        parseInt(answerElement.value);


    if (isNaN(value)) {

        messageElement.textContent =
            "✏️ اكتب الإجابة أولاً";

        messageElement.className =
            "message wrong";

        return;
    }


    const correctAnswer =
        numberA + numberB;


    /* الإجابة صحيحة */

    if (value === correctAnswer) {

        answered = true;


        score += 10;

        scoreElement.textContent =
            score;


        messageElement.textContent =
            "🎉 أحسنت! إجابة صحيحة ⭐";


        messageElement.className =
            "message correct";


        answerElement.disabled =
            true;

        checkAnswerButton.disabled =
            true;


        nextQuestionButton.style.display =
            "inline-block";

    }


    /* الإجابة خاطئة */

    else {

        messageElement.textContent =
            "❌ إجابة غير صحيحة، حاول مرة أخرى";

        messageElement.className =
            "message wrong";


        answerElement.focus();

        answerElement.select();
    }
}


/* ==========================================
   الانتقال للعملية التالية
========================================== */

function nextQuestion() {

    if (
        currentQuestion <
        TOTAL_QUESTIONS
    ) {

        currentQuestion++;

        createQuestion();

    }

    else {

        finishLevel();
    }
}


/* ==========================================
   إنهاء المستوى
========================================== */

function finishLevel() {

    additionCard.style.display =
        "none";


    completeElement.style.display =
        "block";


    if (currentLevel < 5) {

        unlockNextLevel();


        completeTextElement.textContent =
            "🎉 رائع! لقد أكملت جميع عمليات المستوى " +
            currentLevel +
            ". لقد تم فتح المستوى " +
            (currentLevel + 1) +
            "!";


        nextLevelButton.style.display =
            "inline-block";

    }

    else {

        completeTextElement.textContent =
            "🏆 مذهل! لقد أكملت جميع مستويات الجمع الخمسة!";


        nextLevelButton.style.display =
            "none";
    }


    updateLevelButtons();
}


/* ==========================================
   الانتقال للمستوى التالي
========================================== */

function goToNextLevel() {

    if (currentLevel >= 5) {
        return;
    }


    currentLevel++;

    currentQuestion = 1;


    completeElement.style.display =
        "none";


    additionCard.style.display =
        "block";


    updateLevelButtons();

    createQuestion();
}


/* ==========================================
   اختيار مستوى
========================================== */

function selectLevel(level) {

    const unlocked =
        getUnlockedLevel();


    if (level > unlocked) {

        alert(
            "🔒 أكمل المستوى السابق أولاً"
        );

        return;
    }


    currentLevel = level;

    currentQuestion = 1;


    completeElement.style.display =
        "none";


    additionCard.style.display =
        "block";


    updateLevelButtons();

    createQuestion();
}


/* ==========================================
   تحديث أزرار المستويات
========================================== */

function updateLevelButtons() {

    const unlocked =
        getUnlockedLevel();


    document
        .querySelectorAll(".level-btn")
        .forEach(button => {

            const level =
                parseInt(
                    button.dataset.level
                );


            const icon =
                button.querySelector("span");


            button.classList.remove(
                "active"
            );


            if (level > unlocked) {

                button.classList.add(
                    "locked"
                );

                icon.textContent =
                    "🔒";

            }

            else {

                button.classList.remove(
                    "locked"
                );


                icon.textContent =
                    level === 1 ? "1️⃣" :
                    level === 2 ? "2️⃣" :
                    level === 3 ? "3️⃣" :
                    level === 4 ? "4️⃣" :
                    "5️⃣";


                if (
                    level === currentLevel
                ) {

                    button.classList.add(
                        "active"
                    );
                }
            }

        });
}


/* ==========================================
   أحداث الأزرار
========================================== */

checkAnswerButton.addEventListener(
    "click",
    checkAnswer
);


nextQuestionButton.addEventListener(
    "click",
    nextQuestion
);


nextLevelButton.addEventListener(
    "click",
    goToNextLevel
);


/* اختيار المستوى */

document
    .querySelectorAll(".level-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                const level =
                    parseInt(
                        this.dataset.level
                    );


                selectLevel(level);
            }
        );

    });


/* زر Enter */

answerElement.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            checkAnswer();
        }

    });


/* ==========================================
   بدء اللعبة
========================================== */

updateLevelButtons();

createQuestion();
