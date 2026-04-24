(function () {
  async function requestJson(url, options, fallbackMessage) {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";
    const rawBody = await response.text();

    if (contentType.indexOf("application/json") === -1) {
      throw new Error(
        "A API nao respondeu em JSON. Rode o backend com npm run dev e abra http://localhost:3000."
      );
    }

    let data;

    try {
      data = rawBody ? JSON.parse(rawBody) : null;
    } catch (error) {
      throw new Error("Resposta invalida da API.");
    }

    if (!response.ok) {
      throw new Error((data && data.message) || fallbackMessage);
    }

    return data;
  }

  window.FlowTaskApi = {
    requestJson: requestJson
  };
})();
