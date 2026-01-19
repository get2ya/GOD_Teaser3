// GOH 타이틀 영상 페이지 (A→B 루프 전환)
// 로딩바 연출: A+B 영상 동시 다운로드, big_change로 진행률 표시
// A영상 종료 시점에 B영상이 처음부터 시작되도록 타이밍 맞춤
// requestAnimationFrame으로 정밀 타이밍 (약 16ms 간격)
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const mainVideo = document.getElementById('main-video');
    const loopVideo = document.getElementById('loop-video');
    const bgGroup = document.querySelector('.background-group');
    const dimOverlay = document.getElementById('video-dim-overlay');
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingMask = document.getElementById('loading-mask');

    if (!mainVideo || !loopVideo) return;

    // 플래그
    let loopStarted = false;
    let animFrameId = null;

    // 배경 이미지 프리로드
    function preloadImages() {
        return new Promise(function(resolve) {
            const images = [
                '../resource/background.webp',
                '../resource/big_change.webp',
                '../resource/big_2.webp'
            ];
            let loaded = 0;

            images.forEach(function(src) {
                const img = new Image();
                img.onload = img.onerror = function() {
                    loaded++;
                    if (loaded === images.length) resolve();
                };
                img.src = src;
            });
        });
    }

    // XMLHttpRequest로 영상 다운로드 진행률 추적
    function downloadVideoWithProgress(url) {
        return new Promise(function(resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'blob';

            xhr.onprogress = function(e) {
                if (e.lengthComputable) {
                    // 진행률 이벤트 발생
                    const event = new CustomEvent('videoProgress', {
                        detail: { url: url, loaded: e.loaded, total: e.total }
                    });
                    document.dispatchEvent(event);
                }
            };

            xhr.onload = function() {
                if (xhr.status === 200) {
                    resolve({ url: url, blob: xhr.response, size: xhr.response.size });
                } else {
                    reject(new Error('Download failed: ' + xhr.status));
                }
            };

            xhr.onerror = function() {
                reject(new Error('Network error'));
            };

            xhr.send();
        });
    }

    // 로딩바 업데이트
    let videoProgress = {
        main: { loaded: 0, total: 0 },
        loop: { loaded: 0, total: 0 }
    };

    function updateLoadingBar() {
        const totalLoaded = videoProgress.main.loaded + videoProgress.loop.loaded;
        const totalSize = videoProgress.main.total + videoProgress.loop.total;

        if (totalSize > 0) {
            const percent = (totalLoaded / totalSize) * 100;
            // 마스크 width를 100%에서 0%로 줄임 (좌→우로 이미지가 드러남)
            if (loadingMask) {
                loadingMask.style.width = (100 - percent) + '%';
            }
            console.log('로딩 진행률:', percent.toFixed(1) + '%');
        }
    }

    // 진행률 이벤트 리스너
    document.addEventListener('videoProgress', function(e) {
        const detail = e.detail;
        if (detail.url.includes('_A.webm')) {
            videoProgress.main.loaded = detail.loaded;
            videoProgress.main.total = detail.total;
        } else if (detail.url.includes('_B.webm')) {
            videoProgress.loop.loaded = detail.loaded;
            videoProgress.loop.total = detail.total;
        }
        updateLoadingBar();
    });

    // 영상 동시 다운로드 및 로드
    function downloadAndLoadVideos() {
        const mainUrl = '../resource/MV/GOH_title_0114_A.webm';
        const loopUrl = '../resource/MV/GOH_title_0114_B.webm';

        return Promise.all([
            downloadVideoWithProgress(mainUrl),
            downloadVideoWithProgress(loopUrl)
        ]).then(function(results) {
            // Blob URL 생성 및 video에 설정
            results.forEach(function(result) {
                const blobUrl = URL.createObjectURL(result.blob);
                if (result.url.includes('_A.webm')) {
                    mainVideo.src = blobUrl;
                } else if (result.url.includes('_B.webm')) {
                    loopVideo.src = blobUrl;
                }
            });

            // 두 영상 모두 로드 대기
            return Promise.all([
                waitForVideo(mainVideo),
                waitForVideo(loopVideo)
            ]);
        });
    }

    // 영상 로드 대기
    function waitForVideo(video) {
        return new Promise(function(resolve) {
            if (video.readyState >= 3) {
                resolve();
            } else {
                video.addEventListener('canplaythrough', resolve, { once: true });
            }
        });
    }

    // B영상 시작 타이밍 (A영상 종료 몇 초 전) - 1프레임 = 약 0.033초
    const B_START_BEFORE = 0.033;
    // 네이버 버튼 + dim 오버레이 시작 타이밍 (A영상 종료 몇 초 전)
    const BUTTON_START_BEFORE = 0.5;

    // 플래그
    let buttonStarted = false;

    // 정밀 타이밍 체크 (requestAnimationFrame)
    function checkTiming() {
        if (!mainVideo.duration || !loopVideo.duration) {
            animFrameId = requestAnimationFrame(checkTiming);
            return;
        }

        const remaining = mainVideo.duration - mainVideo.currentTime;

        // 네이버 버튼 + dim 오버레이: A영상 종료 0.5초 전에 시작
        if (!buttonStarted && remaining <= BUTTON_START_BEFORE) {
            buttonStarted = true;
            console.log('=== 네이버 버튼 + dim 오버레이 시작 ===');
            console.log('A영상 remaining:', remaining.toFixed(3));
            if (dimOverlay) {
                dimOverlay.classList.add('active');
            }
            if (naverBtn) {
                naverBtn.classList.add('visible');
                // 등장 transition 완료 후(2초) 맥동 효과 시작
                setTimeout(function() {
                    naverBtn.classList.add('pulsing');
                    console.log('=== 네이버 버튼 맥동 시작 ===');
                }, 2000);
            }
        }

        // B영상: A영상 종료 0.033초(1프레임) 전에 시작
        if (!loopStarted && remaining <= B_START_BEFORE) {
            startLoopVideo();
        }

        function startLoopVideo() {
            loopStarted = true;
            console.log('=== B영상 시작 ===');
            console.log('A영상 currentTime:', mainVideo.currentTime.toFixed(3));
            console.log('A영상 remaining:', (mainVideo.duration - mainVideo.currentTime).toFixed(3));
            // B영상 opacity 1로 변경 (이제서야 보이게)
            loopVideo.style.opacity = '1';
            // B영상을 끝에서 0.033초 전 위치부터 시작
            loopVideo.currentTime = loopVideo.duration - B_START_BEFORE;
            loopVideo.play().catch(function() {});
            console.log('B영상 시작 위치:', loopVideo.currentTime.toFixed(3));
        }

        // A영상이 아직 재생 중이면 계속 체크
        if (!mainVideo.ended) {
            animFrameId = requestAnimationFrame(checkTiming);
        }
    }

    // A영상 재생 시작
    function startPlayback() {
        // A영상 보이게 + 재생
        mainVideo.classList.add('visible');
        mainVideo.play().catch(function() {});
        // B영상은 초기에 숨겨둠 (A종료 0.033초 전에 opacity 1로 변경)
        // loopVideo.style.opacity는 checkTiming에서 처리
        // 정밀 타이밍 체크 시작
        animFrameId = requestAnimationFrame(checkTiming);
    }

    // A영상 종료 시 즉시 숨김 → B영상이 보임
    mainVideo.addEventListener('ended', function() {
        // 타이밍 체크 중지
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
        }
        // 타임라인 로그
        console.log('=== A영상 ended 이벤트 ===');
        console.log('A영상 duration:', mainVideo.duration.toFixed(3));
        console.log('A영상 currentTime:', mainVideo.currentTime.toFixed(3));
        console.log('B영상 currentTime:', loopVideo.currentTime.toFixed(3));
        // A영상 즉시 숨김 (B영상은 이미 뒤에서 재생 중)
        mainVideo.style.display = 'none';
        console.log('>>> A영상 숨김 처리 완료 <<<');
    });

    // 초기화: 배경 이미지 + A/B영상 동시 다운로드
    Promise.all([
        preloadImages(),
        downloadAndLoadVideos()
    ]).then(function() {
        console.log('=== 모든 리소스 로드 완료 ===');

        // 로딩 오버레이 페이드아웃
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }

        // 배경 페이드인
        if (bgGroup) {
            bgGroup.classList.add('visible');
        }

        // 배경 페이드인 완료 후(0.7초) 영상 시작
        setTimeout(startPlayback, 700);
    });
})();
