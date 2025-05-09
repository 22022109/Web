(function () {
    document.addEventListener("DOMContentLoaded", () => {
        const API_URL = 'http://localhost:3000/api/auth'; // đổi lại nếu cần

        // Load modal từ login.html
        fetch('login.html')
            .then(res => res.text())
            .then(html => {
                document.getElementById("auth-modal-container").innerHTML = html;
                setupAuthModal();
            })
            .catch(err => {
                console.error("Không thể tải login.html:", err);
            });

        function setupAuthModal() {
            const userIcon = document.getElementById("user-icon");
            const modal = document.querySelector(".modal");
            const loginForm = document.getElementById("login-form");
            const registerForm = document.getElementById("register-form");
            const switchButtons = document.querySelectorAll(".auth-form__switch-button");
            const backButtons = document.querySelectorAll(".btn--normal");
            const userInfoModal = document.querySelector(".modal--user-info");
            const userEmailSpan = document.getElementById("user-email");
            const logoutButton = document.getElementById("logout-btn");

            if (!userIcon || !modal || !loginForm || !registerForm || !userInfoModal) return;

            // Click icon user
            userIcon.addEventListener("click", async (e) => {
                e.preventDefault();
                const token = localStorage.getItem("token");

                if (token) {
                    try {
                        const res = await fetch(`${API_URL}/me`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });

                        if (!res.ok) throw new Error("Token không hợp lệ");
                        const user = await res.json();

                        userEmailSpan.textContent = user.email;
                        document.getElementById("user-fullname").textContent = user.username || "(chưa có)";
                        document.getElementById("user-phone").textContent = user.phonenumber || "(chưa có)";
                        document.getElementById("user-address").textContent = user.address || "(chưa có)";
                        userInfoModal.style.display = "flex";
                    } catch (err) {
                        localStorage.removeItem("token");
                        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                    }
                } else {
                    modal.style.display = "flex";
                    loginForm.style.display = "none";
                    registerForm.style.display = "flex";
                }
            });

            // Chuyển đổi giữa login/register
            switchButtons.forEach(btn => {
                btn.addEventListener("click", () => {
                    const isLoginVisible = loginForm.style.display === "flex";
                    loginForm.style.display = isLoginVisible ? "none" : "flex";
                    registerForm.style.display = isLoginVisible ? "flex" : "none";
                });
            });

            // Nút BACK để đóng modal
            backButtons.forEach(btn => {
                btn.addEventListener("click", () => {
                    modal.style.display = "none";
                    loginForm.style.display = "none";
                    registerForm.style.display = "none";
                    userInfoModal.style.display = "none";
                });
            });

            // Click ngoài overlay để đóng tất cả modal
            window.addEventListener("click", (e) => {
                if (e.target.classList.contains("modal__overlay")) {
                    modal.style.display = "none";
                    loginForm.style.display = "none";
                    registerForm.style.display = "none";
                    userInfoModal.style.display = "none";
                }
            });

            // Đăng ký
            registerForm.querySelector(".btn--primary").addEventListener("click", async (e) => {
                e.preventDefault();
                const email = registerForm.querySelector("input[name='email']").value.trim();
                const password = registerForm.querySelector("input[name='password']").value.trim();
                const confirm = registerForm.querySelector("input[name='confirm']").value.trim();

                if (!email || !password || !confirm) return alert("Vui lòng nhập đầy đủ thông tin");
                if (password !== confirm) return alert("Mật khẩu không khớp");

                try {
                    const res = await fetch(`${API_URL}/register`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                    });

                    const data = await res.json();

                    if (res.ok) {
                        alert("Đăng ký thành công! Mời bạn đăng nhập.");
                        registerForm.style.display = "none";
                        loginForm.style.display = "flex";
                        registerForm.reset?.();
                    } else {
                        alert(data.message || "Đăng ký thất bại");
                    }
                } catch (err) {
                    alert("Lỗi kết nối server");
                }
            });

            // Đăng nhập
            loginForm.querySelector(".btn--primary").addEventListener("click", async (e) => {
                e.preventDefault();
                const email = loginForm.querySelector("input[name='email']").value.trim();
                const password = loginForm.querySelector("input[name='password']").value.trim();

                if (!email || !password) return alert("Vui lòng nhập đầy đủ thông tin");

                try {
                    const res = await fetch(`${API_URL}/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                    });

                    const data = await res.json();

                    if (res.ok) {
                        alert("Đăng nhập thành công");
                        localStorage.setItem("token", data.token);
                        modal.style.display = "none";
                        loginForm.reset?.();
                        registerForm.reset?.();
                    } else {
                        alert(data.message || "Đăng nhập thất bại");
                    }
                } catch (err) {
                    alert("Lỗi kết nối server");
                }
            });

            // Đăng xuất
            logoutButton?.addEventListener("click", () => {
                localStorage.removeItem("token");
                userInfoModal.style.display = "none";
                alert("Đã đăng xuất");
            });
            
            // Đổi mật khẩu

            // Hiển thị form đổi mật khẩu
            const changePasswordBtn = document.getElementById("change-password-btn");
            const changePasswordModal = document.querySelector(".modal--change-password");

            changePasswordBtn?.addEventListener("click", () => {
                changePasswordModal.style.display = "flex";
            });
           // Xử lý khi nhấn nút "Hủy" đổi mật khẩu
            document.getElementById("cancel-change-password")?.addEventListener("click", () => {
                document.querySelector(".modal--change-password").style.display = "none";
            });
            
        // Xử lý khi nhấn "Đổi mật khẩu"
        document.getElementById("submit-change-password")?.addEventListener("click", async (e) => {
            e.preventDefault();
        
            const oldPassword = document.getElementById("oldPassword").value.trim();
            const newPassword = document.getElementById("newPassword").value.trim();
            const confirmNewPassword = document.getElementById("confirmNewPassword").value.trim();
        
            if (!oldPassword || !newPassword || !confirmNewPassword) {
            return alert("Vui lòng nhập đầy đủ thông tin");
            }
        
            if (newPassword !== confirmNewPassword) {
            return alert("Mật khẩu mới không khớp");
            }
        
            // Lấy email từ thông tin hiển thị
            const email = document.getElementById("user-email").textContent.trim();
            const token = localStorage.getItem("token");
        
            try {
            const res = await fetch(`${API_URL}/change-password`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` // nếu backend có dùng xác thực token
                },
                body: JSON.stringify({ email, oldPassword, newPassword })
            });
        
            const data = await res.json();
        
            if (res.ok) {
                alert("Đổi mật khẩu thành công");
                document.getElementById("change-password-form").reset?.();
                document.querySelector(".modal--change-password").style.display = "none";
            } else {
                alert(data.message || "Đổi mật khẩu thất bại");
            }
            } catch (err) {
            alert("Lỗi kết nối server");
            }
        });

        // 🎯 Cập nhật thông tin người dùng
        const updateInfoModal = document.querySelector(".modal--update-info");

        document.getElementById("update-info-btn")?.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        if (!token) return alert("Bạn chưa đăng nhập");

        try {
            const res = await fetch(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` }
            });
            const user = await res.json();

            document.getElementById("update-username").value = user.username || "";
            document.getElementById("update-phone").value = user.phonenumber || "";
            document.getElementById("update-address").value = user.address || "";

            document.getElementById("update-cardnumber").value = user.cardnumber || "";
            document.getElementById("update-cardmonth").value = user.cardmonth || "";
            document.getElementById("update-cardyear").value = user.cardyear || "";
            document.getElementById("update-cardday").value = user.cardday || "";

            updateInfoModal.style.display = "flex";
        } catch (err) {
            alert("Không thể tải thông tin người dùng");
        }
        });

        document.getElementById("cancel-update-info")?.addEventListener("click", () => {
        updateInfoModal.style.display = "none";
        });

        document.getElementById("submit-update-info")?.addEventListener("click", async () => {
        const username = document.getElementById("update-username").value.trim();
        const phonenumber = document.getElementById("update-phone").value.trim();
        const address = document.getElementById("update-address").value.trim();

        const cardnumber = document.getElementById("update-cardnumber").value.trim();
        const cardmonth = document.getElementById("update-cardmonth").value.trim();
        const cardyear = document.getElementById("update-cardyear").value.trim();
        const cardday = document.getElementById("update-cardday").value.trim();

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${API_URL}/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    username,
                    phonenumber,
                    address,
                    cardnumber,
                    cardmonth,
                    cardyear,
                    cardday
                })
            });
        
        
            let data;
            try {
                data = await res.json(); // Có thể lỗi ở đây
            } catch (jsonErr) {
                console.error("🔴 Lỗi phân tích JSON:", jsonErr);
                throw new Error("Phản hồi không phải JSON hợp lệ");
            }
        
            if (res.ok) {
                alert("Cập nhật thành công");
                updateInfoModal.style.display = "none";
        
                document.getElementById("update-username").value = username;
                document.getElementById("update-phone").value = phonenumber;
                document.getElementById("update-address").value = address;

                document.getElementById("update-cardnumber").value = cardnumber;
                document.getElementById("update-cardmonth").value = cardmonth;
                document.getElementById("update-cardyear").value = cardyear;
                document.getElementById("update-cardday").value = cardday;

            } else {
                alert(data.message || "Cập nhật thất bại");
            }
        } catch (err) {
            console.error("🔴 Lỗi trong khối try:", err);
            alert(err.message || "Lỗi kết nối server");
        }
        

        /* ERROR HERE */ 
        });
              
        }
    });
})();
