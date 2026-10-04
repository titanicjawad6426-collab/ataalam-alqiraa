/* ==========================================
   تعلم الجمع
   صفحة العمليات
========================================== */

const TOTAL_QUESTIONS = 10;


/* عدد أرقام كل مستوى */

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
   قراءة المستوى من الرابط
========================================== */

const params =
    new URLSearchParams(
        window.location.search
    );

const requestedLevel =
    parseInt(
        params.get("level")
    );


/* المستوى المفتوح */

let unlockedLevel =
    parseInt(
        localStorage.getItem(
            "additionUnlockedLevel"
        )
    );


if (
    isNaN(unlockedLevel) ||
    unlockedLevel < 1
) {

    unlockedLevel = 1;

    localStorage.setItem(
        "additionUnlockedLevel",
        "1"
    );
}


if (
    !isNaN(requestedLevel) &&
    requestedLevel >= 1 &&
    requestedLevel <= unlockedLevel
) {

    currentLevel =
        requestedLevel;

}


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

const levelTitleElement =
    document.getElementById("levelTitle");

const additionCard =
    document.getElementById("additionCard");

const levelFinished =
    document.getElementById("levelFinished");

const finishedText =
    document.getElementById("finishedText");

const backToLevels =
    document.getElementById("backToLevels");


/* ==========================================
   إنشاء رقم
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
   إنشاء عملية
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

    levelTitleElement.textContent =
        "المستوى " +
        currentLevel;


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
   التحقق
========================================== */

function checkAnswer() {

    if (answered) {
        return;
    }


    if (
        answerElement.value.trim() === ""
    ) {

        messageElement.textContent =
            "✏️ اكتب الإجابة أولاً";

        messageElement.className =
            "message wrong";

        return;
    }


    const userAnswer =
        Number(
            answerElement.value
        );


    const correctAnswer =
        numberA + numberB;


    if (userAnswer === correctAnswer) {

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
   العملية التالية
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

    /*
        فتح المستوى التالي
    */

    if (currentLevel < 5) {

        const nextLevel =
            currentLevel + 1;


        const currentUnlocked =
            parseInt(
                localStorage.getItem(
                    "additionUnlockedLevel"
                )
            ) || 1;


        if (
            nextLevel >
            currentUnlocked
        ) {

            localStorage.setItem(
                "additionUnlockedLevel",
                nextLevel.toString()
            );
        }
    }


    /*
        عرض رسالة النجاح
    */

    additionCard.style.display =
        "none";

    levelFinished.style.display =
        "block";


    if (currentLevel < 5) {

        finishedText.textContent =
            "🎉 لقد أكملت المستوى " +
            currentLevel +
            " بنجاح! المستوى " +
            (currentLevel + 1) +
            " أصبح مفتوحًا الآن.";

    }

    else {

        finishedText.textContent =
            "🏆 رائع جدًا! لقد أكملت جميع مستويات الجمع الخمسة!";
    }
}


/* ==========================================
   العودة إلى صفحة المستويات
========================================== */

backToLevels.addEventListener(
    "click",
    function () {

        window.location.href =
            "addition-levels.html";

    }
);


/* ==========================================
   الأحداث
========================================== */

checkAnswerButton.addEventListener(
    "click",
    checkAnswer
);


nextQuestionButton.addEventListener(
    "click",
    nextQuestion
);


answerElement.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            checkAnswer();
        }

    }
);


/* ==========================================
   بدء المستوى
========================================== */

createQuestion();
