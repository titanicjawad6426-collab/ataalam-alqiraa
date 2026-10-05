/* =========================================================
   تعلم الضرب - الضرب العمودي المدرسي
   10 مستويات × 12 عملية

   القاعدة:
   - إذا كان العدد السفلي من رقم واحد:
     النتيجة مباشرة.
     مثال:
         1
     ×   5
     ─────
         ?
     
   - إذا كان العدد السفلي من رقمين أو أكثر:
     نستخدم الجداءات الجزئية ثم الناتج النهائي.
========================================================= */


const TOTAL_QUESTIONS = 12;
const MAX_LEVEL = 10;

const PROGRESS_KEY = "multiplicationUnlockedLevelV1";


// =========================================================
// إعداد المستويات
// =========================================================

const levelDigits = {

    1: [1, 1],
    2: [2, 1],
    3: [2, 2],
    4: [3, 2],
    5: [3, 3],
    6: [4, 3],
    7: [4, 4],
    8: [5, 4],
    9: [5, 5],
    10: [6, 5]
};


// =========================================================
// عناصر الصفحة
// =========================================================

const numberAElement =
    document.getElementById("numberA");

const numberBElement =
    document.getElementById("numberB");

const partialResultsElement =
    document.getElementById("partialResults");

const finalResultArea =
    document.getElementById("finalResultArea");

const answerInput =
    document.getElementById("answerInput");

const checkAnswerButton =
    document.getElementById("checkAnswerButton");

const feedback =
    document.getElementById("feedback");

const stepTitle =
    document.getElementById("stepTitle");

const stepInstruction =
    document.getElementById("stepInstruction");

const levelTitle =
    document.getElementById("levelTitle");

const questionCounter =
    document.getElementById("questionCounter");

const progressFill =
    document.getElementById("progressFill");

const resultCard =
    document.getElementById("resultCard");

const resultSummary =
    document.getElementById("resultSummary");

const unlockMessage =
    document.getElementById("unlockMessage");

const reviewList =
    document.getElementById("reviewList");

const retryButton =
    document.getElementById("retryButton");

const celebration =
    document.getElementById("celebration");


// =========================================================
// معرفة المستوى
// =========================================================

const urlParams =
    new URLSearchParams(window.location.search);

let currentLevel =
    parseInt(urlParams.get("level")) || 1;


// حماية المستوى

if (
    currentLevel < 1 ||
    currentLevel > MAX_LEVEL
) {
    currentLevel = 1;
}


// =========================================================
// المستوى المفتوح
// =========================================================

let unlockedLevel =
    parseInt(
        localStorage.getItem(PROGRESS_KEY)
    ) || 1;


if (unlockedLevel < 1) {
    unlockedLevel = 1;
}


// إذا حاول المستخدم الدخول إلى مستوى مغلق

if (currentLevel > unlockedLevel) {

    alert(
        "🔒 هذا المستوى مغلق.\nأكمل المستوى السابق أولاً."
    );

    window.location.href =
        "multiplication-levels.html";
}


// =========================================================
// متغيرات اللعبة
// =========================================================

let questions = [];

let currentQuestionIndex = 0;

let currentQuestion = null;

let currentStep = 0;

let score = 0;

let questionResults = [];

let waitingForNextQuestion = false;


// مهم جداً:
// هل أخطأ الطفل في العملية الحالية؟

let currentQuestionHadError = false;


// =========================================================
// إنشاء رقم عشوائي بعدد خانات محدد
// =========================================================

function randomNumber(digits) {

    if (digits === 1) {

        return Math.floor(
            Math.random() * 9
        ) + 1;
    }

    const min =
        Math.pow(10, digits - 1);

    const max =
        Math.pow(10, digits) - 1;

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;
}


// =========================================================
// إنشاء عملية جديدة
// =========================================================

function createQuestion() {

    const digits =
        levelDigits[currentLevel];

    const digitsA = digits[0];

    const digitsB = digits[1];

    let a;
    let b;

    do {

        a = randomNumber(digitsA);

        b = randomNumber(digitsB);

    } while (
        a === b ||
        (
            digitsA === digitsB &&
            a > b
        )
    );


    return {

        a: a,

        b: b,

        answer: a * b
    };
}


// =========================================================
// إنشاء 12 عملية بدون تكرار
// =========================================================

function generateQuestions() {

    questions = [];

    const used = new Set();

    let attempts = 0;

    while (
        questions.length < TOTAL_QUESTIONS &&
        attempts < 10000
    ) {

        attempts++;

        const q =
            createQuestion();


        const key =
            `${q.a}x${q.b}`;

        const reverseKey =
            `${q.b}x${q.a}`;


        if (
            used.has(key) ||
            used.has(reverseKey)
        ) {
            continue;
        }


        used.add(key);

        questions.push(q);
    }
}


// =========================================================
// بدء المستوى
// =========================================================

function startLevel() {

    generateQuestions();

    currentQuestionIndex = 0;

    score = 0;

    questionResults = [];

    resultCard.style.display =
        "none";

    celebration.style.display =
        "none";

    loadQuestion();
}


// =========================================================
// تحميل العملية
// =========================================================

function loadQuestion() {

    currentQuestion =
        questions[currentQuestionIndex];

    currentStep = 0;

    waitingForNextQuestion = false;

    currentQuestionHadError = false;


    answerInput.disabled = false;

    checkAnswerButton.disabled = false;

    answerInput.value = "";

    feedback.textContent = "";

    feedback.className =
        "feedback";


    numberAElement.textContent =
        currentQuestion.a;

    numberBElement.textContent =
        currentQuestion.b;


    levelTitle.textContent =
        `المستوى ${currentLevel}`;


    questionCounter.textContent =
        `العملية ${currentQuestionIndex + 1} من ${TOTAL_QUESTIONS}`;


    const progress =
        (
            currentQuestionIndex /
            TOTAL_QUESTIONS
        ) * 100;


    progressFill.style.width =
        `${progress}%`;


    buildOperation();

    updateStep();


    setTimeout(() => {

        answerInput.focus();

    }, 100);
}


// =========================================================
// إنشاء شكل العملية العمودية
// =========================================================

function buildOperation() {

    partialResultsElement.innerHTML = "";

    finalResultArea.innerHTML = "";


    /*
      عدد خانات العدد السفلي
    */

    const digits =
        String(currentQuestion.b)
            .split("")
            .reverse();


    /*
      إذا كان العدد السفلي من رقم واحد:

          1
      ×   5
      ─────
          ?

      لا نعرض الجداء الجزئي.
    */

    if (digits.length === 1) {

        const finalLine =
            document.createElement("div");

        finalLine.className =
            "final-line";


        finalResultArea.appendChild(
            finalLine
        );


        const finalRow =
            document.createElement("div");

        finalRow.className =
            "final-row";


        finalRow.innerHTML =
            `<span class="final-value">?</span>`;


        finalResultArea.appendChild(
            finalRow
        );


        return;
    }


    /*
      العدد السفلي من رقمين أو أكثر:

      نعرض الجداءات الجزئية.
    */

    digits.forEach(
        (digit, index) => {

            const row =
                document.createElement("div");

            row.className =
                "partial-row";


            /*
              إزاحة بصرية فقط.
              لا نضيف أصفار.
            */

            row.style.paddingLeft =
                `${index * 1.2}em`;


            row.dataset.index =
                index;


            row.innerHTML =
                `<span class="partial-value">?</span>`;


            partialResultsElement.appendChild(
                row
            );
        }
    );


    // خط الجمع

    const finalLine =
        document.createElement("div");

    finalLine.className =
        "final-line";


    finalResultArea.appendChild(
        finalLine
    );


    // الناتج النهائي

    const finalRow =
        document.createElement("div");

    finalRow.className =
        "final-row";


    finalRow.innerHTML =
        `<span class="final-value">?</span>`;


    finalResultArea.appendChild(
        finalRow
    );
}


// =========================================================
// حساب النواتج الجزئية
// =========================================================

function getPartialProducts() {

    const digits =
        String(currentQuestion.b)
            .split("")
            .reverse();


    return digits.map(
        (digit, index) => {

            const number =
                Number(digit);


            const baseProduct =
                currentQuestion.a * number;


            return {

                digit: number,

                product: baseProduct,

                shift: index,

                displayProduct:
                    baseProduct
            };
        }
    );
}


// =========================================================
// تحديث تعليمات الخطوة
// =========================================================

function updateStep() {

    const partialProducts =
        getPartialProducts();


    const numberOfPartialSteps =
        partialProducts.length;


    /*
      ============================================
      إذا كان العدد السفلي من رقم واحد
      ============================================

      مثال:

          1
      ×   5
      ─────
          ?

      لا توجد خطوة جداء جزئي.
      ننتقل مباشرة للناتج النهائي.
    */

    if (numberOfPartialSteps === 1) {

        currentStep =
            numberOfPartialSteps;


        stepTitle.textContent =
            "النتيجة";


        stepInstruction.innerHTML =
            `احسب: <strong>${currentQuestion.a} × ${currentQuestion.b}</strong>`;


        answerInput.placeholder =
            "اكتب ناتج الضرب";


        return;
    }


    /*
      ============================================
      العمليات متعددة الأرقام
      ============================================
    */

    if (
        currentStep <
        numberOfPartialSteps
    ) {

        const step =
            partialProducts[currentStep];


        stepTitle.textContent =
            `الخطوة ${currentStep + 1}`;


        stepInstruction.innerHTML =
            `احسب: <strong>${currentQuestion.a} × ${step.digit}</strong>`;


        answerInput.placeholder =
            "اكتب ناتج الضرب";


        return;
    }


    /*
      ============================================
      خطوة الناتج النهائي
      ============================================
    */

    stepTitle.textContent =
        "النتيجة النهائية";


    stepInstruction.innerHTML =
        "الآن اجمع النواتج الجزئية واحسب الناتج النهائي.";


    answerInput.placeholder =
        "اكتب الناتج النهائي";


    showPartialProducts();
}


// =========================================================
// إظهار النواتج الجزئية
// =========================================================

function showPartialProducts() {

    const partialProducts =
        getPartialProducts();


    const rows =
        partialResultsElement
            .querySelectorAll(
                ".partial-row"
            );


    partialProducts.forEach(
        (item, index) => {

            if (!rows[index]) {
                return;
            }


            const value =
                rows[index]
                    .querySelector(
                        ".partial-value"
                    );


            value.textContent =
                item.product;


            rows[index]
                .style.paddingLeft =
                `${index * 1.2}em`;
        }
    );
}


// =========================================================
// التحقق من الإجابة
// =========================================================

function checkAnswer() {

    if (waitingForNextQuestion) {
        return;
    }


    const value =
        answerInput.value.trim();


    if (value === "") {

        feedback.textContent =
            "✏️ اكتب الإجابة أولاً.";

        feedback.className =
            "feedback wrong";

        answerInput.focus();

        return;
    }


    const userAnswer =
        Number(value);


    const partialProducts =
        getPartialProducts();


    // =================================================
    // إذا كان العدد السفلي من رقم واحد
    // النتيجة مباشرة
    // =================================================

    if (
        partialProducts.length === 1
    ) {

        const correctFinal =
            currentQuestion.answer;


        if (
            userAnswer ===
            correctFinal
        ) {

            feedback.textContent =
                "🎉 صحيح!";

            feedback.className =
                "feedback correct";


            /*
              لا نحسب العملية إلا إذا
              لم يحدث أي خطأ فيها.
            */

            if (!currentQuestionHadError) {

                score++;
            }


            showFinalResult(
                correctFinal
            );


            setTimeout(() => {

                nextQuestion();

            }, 700);


        } else {

            feedback.textContent =
                "❌ الناتج غير صحيح. حاول مرة أخرى.";

            feedback.className =
                "feedback wrong";


            currentQuestionHadError = true;


            recordFinalError(
                userAnswer,
                correctFinal
            );


            answerInput.select();
        }


        return;
    }


    // =================================================
    // مرحلة النواتج الجزئية
    // =================================================

    if (
        currentStep <
        partialProducts.length
    ) {

        const step =
            partialProducts[currentStep];


        const correctAnswer =
            step.product;


        if (
            userAnswer ===
            correctAnswer
        ) {

            feedback.textContent =
                "✅ إجابة صحيحة!";

            feedback.className =
                "feedback correct";


            showCorrectPartial(
                currentStep,
                correctAnswer
            );


            currentStep++;


            answerInput.value = "";


            setTimeout(() => {

                feedback.textContent = "";

                updateStep();

                answerInput.focus();

            }, 600);


        } else {

            feedback.textContent =
                "❌ غير صحيح. حاول مرة أخرى.";

            feedback.className =
                "feedback wrong";


            currentQuestionHadError =
                true;


            recordStepError(
                currentStep,
                userAnswer,
                correctAnswer
            );


            answerInput.select();
        }


        return;
    }


    // =================================================
    // مرحلة الناتج النهائي
    // =================================================

    const correctFinal =
        currentQuestion.answer;


    if (
        userAnswer ===
        correctFinal
    ) {

        feedback.textContent =
            "🎉 صحيح!";

        feedback.className =
            "feedback correct";


        /*
          مهم:
          إذا أخطأ الطفل في أي خطوة سابقة
          فلا تُحسب العملية ضمن الـ 12 الصحيحة.
        */

        if (!currentQuestionHadError) {

            score++;
        }


        showFinalResult(
            correctFinal
        );


        setTimeout(() => {

            nextQuestion();

        }, 700);


    } else {

        feedback.textContent =
            "❌ الناتج غير صحيح. حاول مرة أخرى.";

        feedback.className =
            "feedback wrong";


        currentQuestionHadError =
            true;


        recordFinalError(
            userAnswer,
            correctFinal
        );


        answerInput.select();
    }
}


// =========================================================
// إظهار الناتج النهائي
// =========================================================

function showFinalResult(value) {

    const finalValue =
        finalResultArea
            .querySelector(
                ".final-value"
            );


    if (finalValue) {

        finalValue.textContent =
            value;

        finalValue.classList.add(
            "correct-result"
        );
    }
}


// =========================================================
// عرض الناتج الجزئي الصحيح
// =========================================================

function showCorrectPartial(
    index,
    value
) {

    const rows =
        partialResultsElement
            .querySelectorAll(
                ".partial-row"
            );


    if (!rows[index]) {
        return;
    }


    const valueElement =
        rows[index]
            .querySelector(
                ".partial-value"
            );


    valueElement.textContent =
        value;


    valueElement.classList.add(
        "correct-result"
    );
}


// =========================================================
// تسجيل خطأ في خطوة ضرب
// =========================================================

function recordStepError(
    stepIndex,
    userAnswer,
    correctAnswer
) {

    let current =
        questionResults[
            currentQuestionIndex
        ];


    if (!current) {

        current = {

            a: currentQuestion.a,

            b: currentQuestion.b,

            errors: [],

            finalError: false
        };


        questionResults[
            currentQuestionIndex
        ] = current;
    }


    current.errors.push({

        type: "multiplication",

        step: stepIndex + 1,

        userAnswer: userAnswer,

        correctAnswer: correctAnswer
    });
}


// =========================================================
// تسجيل خطأ في الناتج النهائي
// =========================================================

function recordFinalError(
    userAnswer,
    correctAnswer
) {

    let current =
        questionResults[
            currentQuestionIndex
        ];


    if (!current) {

        current = {

            a: currentQuestion.a,

            b: currentQuestion.b,

            errors: [],

            finalError: false
        };


        questionResults[
            currentQuestionIndex
        ] = current;
    }


    current.finalError = true;


    current.finalUserAnswer =
        userAnswer;


    current.finalCorrectAnswer =
        correctAnswer;
}


// =========================================================
// الانتقال للعملية التالية
// =========================================================

function nextQuestion() {

    if (waitingForNextQuestion) {
        return;
    }


    waitingForNextQuestion = true;


    currentQuestionIndex++;


    if (
        currentQuestionIndex >=
        TOTAL_QUESTIONS
    ) {

        finishLevel();

        return;
    }


    loadQuestion();
}


// =========================================================
// إنهاء المستوى
// =========================================================

function finishLevel() {

    progressFill.style.width =
        "100%";


    answerInput.disabled = true;

    checkAnswerButton.disabled = true;


    resultCard.style.display =
        "block";


    resultSummary.textContent =
        `أجبت بشكل صحيح عن ${score} من ${TOTAL_QUESTIONS} عملية.`;


    reviewList.innerHTML = "";


    // =================================================
    // المستوى مكتمل 12/12
    // =================================================

    if (
        score === TOTAL_QUESTIONS
    ) {

        unlockNextLevel();


        unlockMessage.textContent =
            currentLevel < MAX_LEVEL
                ? `🔓 تم فتح المستوى ${currentLevel + 1}!`
                : "🏆 لقد أكملت جميع مستويات الضرب!";


        showCelebration();


    } else {

        unlockMessage.textContent =
            "🔒 يجب الحصول على 12/12 لفتح المستوى التالي.";
    }


    buildReview();
}


// =========================================================
// فتح المستوى التالي
// =========================================================

function unlockNextLevel() {

    let savedLevel =
        parseInt(
            localStorage.getItem(
                PROGRESS_KEY
            )
        ) || 1;


    if (
        currentLevel >= savedLevel &&
        currentLevel < MAX_LEVEL
    ) {

        savedLevel =
            currentLevel + 1;


        localStorage.setItem(
            PROGRESS_KEY,
            savedLevel
        );
    }
}


// =========================================================
// بطاقة المراجعة
// =========================================================

function buildReview() {

    const errors =
        questionResults.filter(
            item =>
                item &&
                (
                    item.errors.length > 0 ||
                    item.finalError
                )
        );


    if (errors.length === 0) {

        const message =
            document.createElement("div");


        message.className =
            "review-success";


        message.textContent =
            "🌟 ممتاز! لم تخطئ في أي عملية.";


        reviewList.appendChild(
            message
        );


        return;
    }


    const title =
        document.createElement("h3");


    title.textContent =
        "📝 مراجعة الأخطاء";


    reviewList.appendChild(
        title
    );


    errors.forEach(
        (item) => {

            const card =
                document.createElement("div");


            card.className =
                "review-item";


            let html = `
                <strong>
                    العملية:
                    ${item.a} × ${item.b}
                </strong>
            `;


            if (
                item.errors &&
                item.errors.length
            ) {

                item.errors.forEach(
                    error => {

                        html += `
                            <p>
                                ❌ الخطوة ${error.step}:
                                إجابتك
                                <strong>${error.userAnswer}</strong>
                                -
                                الصحيح
                                <strong>${error.correctAnswer}</strong>
                            </p>
                        `;
                    }
                );
            }


            if (item.finalError) {

                html += `
                    <p>
                        ❌ الناتج النهائي:
                        إجابتك
                        <strong>${item.finalUserAnswer}</strong>
                        -
                        الصحيح
                        <strong>${item.finalCorrectAnswer}</strong>
                    </p>
                `;
            }


            card.innerHTML =
                html;


            reviewList.appendChild(
                card
            );
        }
    );
}


// =========================================================
// الاحتفال
// =========================================================

function showCelebration() {

    celebration.style.display =
        "flex";


    createStars();

    playApplause();


    setTimeout(() => {

        celebration.style.display =
            "none";

    }, 4000);
}


// =========================================================
// النجوم
// =========================================================

function createStars() {

    const symbols =
        ["⭐", "🌟", "✨", "🎉"];


    for (
        let i = 0;
        i < 35;
        i++
    ) {

        const star =
            document.createElement("div");


        star.className =
            "flying-star";


        star.textContent =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];


        star.style.left =
            `${Math.random() * 100}%`;


        star.style.animationDelay =
            `${Math.random() * 1.5}s`;


        document.body.appendChild(
            star
        );


        setTimeout(() => {

            star.remove();

        }, 3500);
    }
}


// =========================================================
// صوت التصفيق
// =========================================================

function playApplause() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {
            return;
        }


        const audio =
            new AudioContext();


        const duration =
            1.8;


        for (
            let i = 0;
            i < 25;
            i++
        ) {

            const oscillator =
                audio.createOscillator();


            const gain =
                audio.createGain();


            oscillator.connect(gain);

            gain.connect(
                audio.destination
            );


            oscillator.frequency.value =
                1000 +
                Math.random() * 1000;


            gain.gain.setValueAtTime(
                0,
                audio.currentTime +
                i * 0.07
            );


            gain.gain.linearRampToValueAtTime(
                0.12,
                audio.currentTime +
                i * 0.07 +
                0.01
            );


            gain.gain.exponentialRampToValueAtTime(
                0.001,
                audio.currentTime +
                i * 0.07 +
                0.08
            );


            oscillator.start(
                audio.currentTime +
                i * 0.07
            );


            oscillator.stop(
                audio.currentTime +
                i * 0.07 +
                0.1
            );
        }


        setTimeout(() => {

            audio.close();

        }, duration * 1000);


    } catch (error) {

        console.log(
            "Audio error:",
            error
        );
    }
}


// =========================================================
// زر إعادة المستوى
// =========================================================

retryButton.addEventListener(
    "click",
    () => {

        startLevel();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


// =========================================================
// زر التحقق
// =========================================================

checkAnswerButton.addEventListener(
    "click",
    checkAnswer
);


// =========================================================
// الضغط على Enter
// =========================================================

answerInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            checkAnswer();
        }
    }
);


// =========================================================
// تشغيل اللعبة
// =========================================================

startLevel();
