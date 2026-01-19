// 영상 A/B 비교 테스트 페이지
(function() {
    const videoA = document.getElementById('video-a');
    const videoB = document.getElementById('video-b');
    const aInfo = document.getElementById('a-info');
    const bInfo = document.getElementById('b-info');

    // A 영상 컨트롤
    document.getElementById('a-play').addEventListener('click', function() {
        videoA.play();
    });

    document.getElementById('a-pause').addEventListener('click', function() {
        videoA.pause();
    });

    document.getElementById('a-stop').addEventListener('click', function() {
        videoA.pause();
        videoA.currentTime = 0;
    });

    document.getElementById('a-restart').addEventListener('click', function() {
        videoA.currentTime = 0;
        videoA.play();
    });

    // B 영상 컨트롤
    document.getElementById('b-play').addEventListener('click', function() {
        videoB.play();
    });

    document.getElementById('b-pause').addEventListener('click', function() {
        videoB.pause();
    });

    document.getElementById('b-stop').addEventListener('click', function() {
        videoB.pause();
        videoB.currentTime = 0;
    });

    document.getElementById('b-restart').addEventListener('click', function() {
        videoB.currentTime = 0;
        videoB.play();
    });

    // 동시 컨트롤
    document.getElementById('sync-play').addEventListener('click', function() {
        videoA.play();
        videoB.play();
    });

    document.getElementById('sync-pause').addEventListener('click', function() {
        videoA.pause();
        videoB.pause();
    });

    document.getElementById('sync-restart').addEventListener('click', function() {
        videoA.currentTime = 0;
        videoB.currentTime = 0;
        videoA.play();
        videoB.play();
    });

    // 시간 정보 업데이트
    function updateInfo() {
        if (videoA.duration) {
            aInfo.textContent = '시간: ' + videoA.currentTime.toFixed(2) + 's / ' + videoA.duration.toFixed(2) + 's';
        }
        if (videoB.duration) {
            bInfo.textContent = '시간: ' + videoB.currentTime.toFixed(2) + 's / ' + videoB.duration.toFixed(2) + 's';
        }
        requestAnimationFrame(updateInfo);
    }

    // 둘 다 자동 재생
    function autoPlayVideos() {
        videoA.play();
        videoB.play();
    }

    if (videoA.readyState >= 3 && videoB.readyState >= 3) {
        autoPlayVideos();
    } else {
        let aReady = videoA.readyState >= 3;
        let bReady = videoB.readyState >= 3;

        videoA.addEventListener('canplaythrough', function() {
            aReady = true;
            if (bReady) autoPlayVideos();
        }, { once: true });

        videoB.addEventListener('canplaythrough', function() {
            bReady = true;
            if (aReady) autoPlayVideos();
        }, { once: true });
    }

    // 시간 정보 업데이트 시작
    requestAnimationFrame(updateInfo);
})();
