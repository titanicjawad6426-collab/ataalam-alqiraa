const CACHE_NAME = "ataalam-alqiraa-v22";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",

    "./manifest.json",
    "./audio-manifest.json",

    // ================================
    // اللغة العربية
    // ================================

    "./arabic.html",
    "./arabic-letters.html",
    "./arabic-pronunciation.html",
    "./arabic-reading.html",
    "./arabic-syllables.html",
    "./arabic-words.html",
    "./arabic-exercises.html",

    // ================================
    // اللغة الفرنسية
    // ================================

    "./french.html",
    "./french-letters.html",
    "./french-pronunciation.html",
    "./french-reading.html",
    "./french-syllables.html",
    "./french-words.html",
    "./french-exercises.html",

    // ================================
    // اللغة الإنجليزية
    // ================================

    "./english.html",
    "./english-letters.html",
    "./english-phonics.html",
    "./english-pronunciation.html",
    "./english-reading.html",
    "./english-words.html",
    "./english-exercises.html",

    // ================================
    // الرياضيات
    // ================================

    "./math.html",

    "./addition-levels.html",
    "./addition.html",
    "./addition.js",

    "./multiplication-levels.html",
    "./multiplication.html",
    "./multiplication.js",

    // ================================
    // الألعاب والمسابقات
    // ================================

    "./games.html",
    "./quizzes.html",

    // ================================
    // الأيقونة
    // ================================

    "./icon-512.png"
];


// ============================================
// تثبيت النسخة الجديدة
// ============================================

self.addEventListener("install", event => {

    event.waitUntil(

        (async () => {

            const cache =
                await caches.open(CACHE_NAME);

            for (const file of APP_FILES) {

                try {

                    await cache.add(
                        file
                    );

                    console.log(
                        "Cached:",
                        file
                    );

                } catch (error) {

                    console.warn(
                        "Failed to cache:",
                        file,
                        error
                    );

                }

            }


            // ====================================
            // ملفات الصوت
            // ====================================

            try {

                const response =
                    await fetch(
                        "./audio-manifest.json",
                        {
                            cache: "no-store"
                        }
                    );

                const audioFiles =
                    await response.json();

                console.log(
                    "Audio files found:",
                    audioFiles.length
                );


                for (const file of audioFiles) {

                    try {

                        await cache.add(
                            "./" + file
                        );

                    } catch (error) {

                        console.warn(
                            "Audio failed:",
                            file
                        );

                    }

                }

            } catch (error) {

                console.warn(
                    "Could not load audio manifest:",
                    error
                );

            }


            // تفعيل النسخة الجديدة فوراً

            await self.skipWaiting();

        })()

    );

});


// ============================================
// تفعيل Service Worker الجديد
// ============================================

self.addEventListener("activate", event => {

    event.waitUntil(

        (async () => {

            const cacheNames =
                await caches.keys();


            // حذف جميع النسخ القديمة

            await Promise.all(

                cacheNames
                    .filter(
                        name =>
                            name !== CACHE_NAME
                    )
                    .map(
                        name =>
                            caches.delete(name)
                    )

            );


            // التحكم في الصفحات المفتوحة

            await self.clients.claim();

        })()

    );

});


// ============================================
// تحميل الملفات
// ============================================

self.addEventListener("fetch", event => {

    if (
        event.request.method !== "GET"
    ) {
        return;
    }


    const url =
        new URL(
            event.request.url
        );


    // ========================================
    // ملفات الضرب
    // ========================================
    // هذه الملفات نريد دائماً التأكد من
    // وجود النسخة الجديدة من الإنترنت
    // ========================================

    const isMultiplicationFile =
        url.pathname.endsWith(
            "/multiplication.html"
        ) ||
        url.pathname.endsWith(
            "/multiplication.js"
        ) ||
        url.pathname.endsWith(
            "/multiplication-levels.html"
        );


    if (isMultiplicationFile) {

        event.respondWith(

            (async () => {

                try {

                    const response =
                        await fetch(
                            event.request,
                            {
                                cache: "no-store"
                            }
                        );


                    if (
                        response &&
                        response.status === 200
                    ) {

                        const cache =
                            await caches.open(
                                CACHE_NAME
                            );

                        await cache.put(
                            event.request,
                            response.clone()
                        );

                    }

                    return response;

                } catch (error) {

                    const cached =
                        await caches.match(
                            event.request
                        );

                    if (cached) {
                        return cached;
                    }


                    return new Response(
                        "لا يوجد اتصال بالإنترنت",
                        {
                            status: 503,
                            headers: {
                                "Content-Type":
                                    "text/plain; charset=utf-8"
                            }
                        }
                    );

                }

            })()

        );

        return;
    }


    // ========================================
    // باقي ملفات التطبيق
    // ========================================

    event.respondWith(

        (async () => {

            // البحث في الكاش أولاً

            const cached =
                await caches.match(
                    event.request
                );

            if (cached) {
                return cached;
            }


            // إذا لم يوجد في الكاش
            // نحاول تحميله من الإنترنت

            try {

                const response =
                    await fetch(
                        event.request
                    );


                if (
                    response &&
                    response.status === 200 &&
                    response.type !== "opaque"
                ) {

                    const cache =
                        await caches.open(
                            CACHE_NAME
                        );

                    await cache.put(
                        event.request,
                        response.clone()
                    );

                }

                return response;

            } catch (error) {

                // صفحة العمل بدون إنترنت

                if (
                    event.request.mode ===
                    "navigate"
                ) {

                    const offlinePage =
                        await caches.match(
                            "./index.html"
                        );

                    if (offlinePage) {
                        return offlinePage;
                    }

                }


                return new Response(
                    "لا يوجد اتصال بالإنترنت",
                    {
                        status: 503,

                        headers: {
                            "Content-Type":
                                "text/plain; charset=utf-8"
                        }
                    }
                );

            }

        })()

    );

});
