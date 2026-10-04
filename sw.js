const CACHE_NAME = "ataalam-alqiraa-v5";

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
    "./addition.html",
    "./addition.js",

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


// ================================
// تثبيت التطبيق وتخزين الملفات
// ================================

self.addEventListener("install", event => {

    event.waitUntil(

        (async () => {

            const cache =
                await caches.open(CACHE_NAME);

            // تخزين ملفات التطبيق الأساسية

            for (const file of APP_FILES) {

                try {

                    await cache.add(file);

                    console.log(
                        "Cached:",
                        file
                    );

                } catch (error) {

                    console.warn(
                        "Failed to cache:",
                        file
                    );

                }

            }


            // ================================
            // تخزين ملفات الصوت
            // ================================

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

                        console.log(
                            "Audio cached:",
                            file
                        );

                    } catch (error) {

                        console.warn(
                            "Audio failed:",
                            file
                        );

                    }

                }

            } catch (error) {

                console.error(
                    "Could not load audio manifest",
                    error
                );

            }


            // تفعيل النسخة الجديدة مباشرة

            await self.skipWaiting();

        })()

    );

});


// ================================
// تفعيل النسخة الجديدة
// ================================

self.addEventListener("activate", event => {

    event.waitUntil(

        (async () => {

            const cacheNames =
                await caches.keys();


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


            await self.clients.claim();

        })()

    );

});


// ================================
// تشغيل التطبيق بدون إنترنت
// ================================

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }


    event.respondWith(

        (async () => {

            // البحث أولاً في الذاكرة

            const cached =
                await caches.match(
                    event.request
                );

            if (cached) {
                return cached;
            }


            // محاولة الاتصال بالإنترنت

            try {

                const response =
                    await fetch(
                        event.request
                    );


                // تخزين الملف الجديد

                if (
                    response &&
                    response.status === 200 &&
                    response.type !== "opaque"
                ) {

                    const cache =
                        await caches.open(
                            CACHE_NAME
                        );

                    cache.put(
                        event.request,
                        response.clone()
                    );

                }

                return response;

            } catch (error) {

                // في حالة فتح صفحة HTML
                // بدون إنترنت

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
