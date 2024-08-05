// 画面からのリクエストを処理するモジュール
// 即時関数でモジュール化
const usersModule = (() => {
  const BASE_URL = "http://localhost:3000/api/v1/users";

  // ヘッダーの設定
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  const handleError = async (res) => {
    const resJson = await res.json();

    switch (res.status) {
      case 200:
        alert(res.json.message);
        window.location.href = "/";
        break;
      case 201:
        alert(res.json.message);
        window.location.href = "/";
        break;
      case 400:
        // リクエストのパラメータが不正な場合
        alert(res.json.error);
        break;
      case 404:
        // リクエストのリソースが見つからない場合
        alert(res.json.error);
        break;
      case 500:
        // サーバー側でエラーが発生した場合
        alert(res.json.error);
        break;
      default:
        alert("予期せぬエラーが発生しました");
    }

    alert(resJson.message);
    window.location.href = "/";
  };

  return {
    // 既存のユーザーを取得する
    fetchAllUsers: async () => {
      const res = await fetch(BASE_URL);
      const users = await res.json();

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const body = `<tr>
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.profile}</td>
          <td>${user.date_of_birth}</td>
          <td>${user.created_at}</td>
          <td>${user.updated_at}</td>
          <td><a href="edit.html?uid=${user.id}">編集</a></td>
          </tr>`;
        document
          .getElementById("users-list")
          .insertAdjacentHTML("beforeend", body);
      }
    },
    // ユーザーを新規作成する
    createUser: async () => {
      const name = document.getElementById("name").value;
      const profile = document.getElementById("profile").value;
      const dateOfBirth = document.getElementById("date-of-birth").value;

      // リクエストのbody
      const body = {
        name: name,
        profile: profile,
        date_of_birth: dateOfBirth,
      };

      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });
      return handleError(res);
    },

    // 編集画面で、現在のユーザー情報を取得する
    setExistingValue: async (uid) => {
      const res = await fetch(BASE_URL + "/" + uid);
      const resJSon = await res.json();

      document.getElementById("name").value = resJSon.name;
      document.getElementById("profile").value = resJSon.profile;
      document.getElementById("date-of-birth").value = resJSon.date_of_birth;
    },

    // ユーザー情報を更新する
    saveUser: async (uid) => {
      const name = document.getElementById("name").value;
      const profile = document.getElementById("profile").value;
      const dateOfBirth = document.getElementById("date-of-birth").value;

      // リクエストのbody
      const body = {
        name: name,
        profile: profile,
        date_of_birth: dateOfBirth,
      };

      const res = await fetch(`${BASE_URL}/${uid}`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(body),
      });
      return handleError(res);
    },
    deleteUser: async (uid) => {
      const ret = window.confirm("このユーザーを削除しますか？");

      if (!ret) {
        return false;
      } else {
        const res = await fetch(`${BASE_URL}/${uid}`, {
          method: "DELETE",
          headers: headers,
        });
        return handleError(res);
      }
    },
  };
})();
