/* =====================================================
   OCEAN SEAFOOD - FILE: js/ocean3d.js
   Nội dung: cảnh biển 3D ở banner trang chủ (Three.js thuần)
   - Mặt nước gợn sóng
   - Bong bóng nổi lên
   - Camera xoay nhẹ theo chuột
   Chỉ chạy khi trình duyệt hỗ trợ WebGL và không bật
   "giảm chuyển động". Lỗi gì cũng không làm hỏng trang.
   ===================================================== */

(function () {

  // Kiểm tra trình duyệt có vẽ được 3D (WebGL) hay không
  function canRun3D() {
    if (typeof THREE === "undefined") return false;              // Three.js chưa tải được (ví dụ mất mạng)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    if (window.innerWidth < 900) return false;                    // màn hình hẹp: để CSS ẩn, khỏi tốn tài nguyên

    try {
      const testCanvas = document.createElement("canvas");
      return !!(testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"));
    } catch (error) {
      return false;
    }
  }

  function initOcean3D() {
    const container = document.getElementById("ocean3d");
    if (!container || !canRun3D()) return;   // không đủ điều kiện: giữ nguyên nền gradient có sẵn

    let width = container.clientWidth;
    let height = container.clientHeight;
    if (width === 0 || height === 0) return;

    /* ---------- 1. DỰNG CẢNH, CAMERA, MÁY VẼ ---------- */
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 5, 13);
    camera.lookAt(0, 0, 0);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: nền trong suốt
    } catch (error) {
      return;   // trình duyệt từ chối tạo WebGL thì thôi, không hiện lỗi cho người dùng
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));   // giới hạn để đỡ nặng máy
    container.appendChild(renderer.domElement);

    /* ---------- 2. ÁNH SÁNG ---------- */
    scene.add(new THREE.AmbientLight(0x9fc6e8, 0.8));
    const sunLight = new THREE.DirectionalLight(0xffe9b0, 0.9);
    sunLight.position.set(5, 10, 6);
    scene.add(sunLight);

    /* ---------- 3. MẶT BIỂN (một tấm lưới sẽ được làm gợn sóng) ---------- */
    const seaGeometry = new THREE.PlaneGeometry(40, 30, 50, 50);
    const seaMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a4d8c,
      roughness: 0.35,
      metalness: 0.25,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide
    });
    const sea = new THREE.Mesh(seaGeometry, seaMaterial);
    sea.rotation.x = -Math.PI / 2.3;   // đặt nằm ngang, hơi nghiêng để nhìn thấy chiều sâu
    sea.position.y = -2.2;
    scene.add(sea);

    // Lưu lại vị trí gốc của từng đỉnh lưới, dùng để tính gợn sóng mỗi khung hình
    const basePositions = seaGeometry.attributes.position.array.slice();

    /* ---------- 4. BONG BÓNG NỔI LÊN ---------- */
    const bubbleGroup = new THREE.Group();
    const bubbleGeometry = new THREE.SphereGeometry(0.16, 10, 10);
    const bubbleMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
      roughness: 0.15
    });

    const bubbles = [];
    const BUBBLE_COUNT = 24;

    // Đặt lại một bong bóng về vị trí ngẫu nhiên (dùng lại thay vì tạo mới, cho nhẹ máy)
    function resetBubble(bubble, randomHeight) {
      bubble.position.x = (Math.random() - 0.5) * 22;
      bubble.position.z = (Math.random() - 0.5) * 14 + 1;
      bubble.position.y = randomHeight ? Math.random() * 9 - 3 : -3;
      bubble.scale.setScalar(0.5 + Math.random());
      bubble.userData.speed = 0.012 + Math.random() * 0.02;
    }

    for (let i = 0; i < BUBBLE_COUNT; i++) {
      const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
      resetBubble(bubble, true);
      bubbleGroup.add(bubble);
      bubbles.push(bubble);
    }
    scene.add(bubbleGroup);

    /* ---------- 5. CHUỘT DI CHUYỂN THÌ CAMERA XOAY NHẸ ---------- */
    let targetX = 0;
    container.addEventListener("pointermove", function (event) {
      const box = container.getBoundingClientRect();
      targetX = ((event.clientX - box.left) / box.width - 0.5) * 6;   // -3 đến +3
    });

    /* ---------- 6. VÒNG LẶP VẼ LẠI MỖI KHUNG HÌNH ---------- */
    const clock = new THREE.Clock();

    function animate() {
      // Tab đang ẩn (chuyển sang tab khác) thì tạm dừng để đỡ tốn máy
      if (document.hidden) {
        requestAnimationFrame(animate);
        return;
      }

      const time = clock.getElapsedTime();

      // Gợn sóng: đổi độ cao (trục Z của mặt phẳng) theo hàm sin/cos dựa trên vị trí gốc
      const positions = seaGeometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = basePositions[i];
        const y = basePositions[i + 1];
        positions[i + 2] = Math.sin(x * 0.45 + time) * 0.35 +
                            Math.cos(y * 0.35 + time * 0.8) * 0.3;
      }
      seaGeometry.attributes.position.needsUpdate = true;
      seaGeometry.computeVertexNormals();

      // Bong bóng nổi dần lên, chạm đỉnh thì quay lại đáy
      bubbles.forEach(function (bubble) {
        bubble.position.y += bubble.userData.speed;
        if (bubble.position.y > 6.5) resetBubble(bubble, false);
      });

      // Camera trôi nhẹ theo chuột
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    /* ---------- 7. CO GIÃN THEO KÍCH THƯỚC CỬA SỔ ---------- */
    window.addEventListener("resize", function () {
      width = container.clientWidth;
      height = container.clientHeight;
      if (width === 0 || height === 0) return;   // banner đang ẩn (màn hình hẹp): bỏ qua
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
  }

  document.addEventListener("DOMContentLoaded", initOcean3D);
})();