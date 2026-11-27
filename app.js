(() => {
  const $ = (id) => document.getElementById(id);
  const cfg = window.APP_CONFIG || {};
  const configured = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("COLE_AQUI") && !cfg.SUPABASE_ANON_KEY.includes("COLE_AQUI");

  const authPanel = $("authPanel");
  const appPanel = $("appPanel");
  const authForm = $("authForm");
  const authSubmit = $("authSubmit");
  const toggleAuth = $("toggleAuth");
  const authMessage = $("authMessage");
  const formMessage = $("formMessage");
  const records = $("records");
  const logoutBtn = $("logoutBtn");
  let isSignup = false;
  let supabaseClient = null;

  function message(el, text, error = false) {
    el.textContent = text;
    el.className = "message" + (error ? " error" : " success");
  }

  function showAuthenticated(user) {
    authPanel.classList.add("hidden");
    appPanel.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    loadRecords();
  }

  function showUnauthenticated() {
    authPanel.classList.remove("hidden");
    appPanel.classList.add("hidden");
    logoutBtn.classList.add("hidden");
  }

  function safeText(tag, value, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = value ?? "";
    return el;
  }

  async function loadRecords() {
    records.replaceChildren(safeText("p", "Carregando ocorrências...", "muted"));
    const { data, error } = await supabaseClient
      .from("ocorrencias")
      .select("id, titulo, descricao, local, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      records.replaceChildren(safeText("p", "Não foi possível carregar os registros: " + error.message, "message error"));
      return;
    }
    records.replaceChildren();
    if (!data || data.length === 0) {
      records.append(safeText("p", "Nenhuma ocorrência cadastrada. Use o formulário acima para criar a primeira.", "empty-state"));
      return;
    }

    data.forEach((item) => {
      const card = document.createElement("article");
      card.className = "record-card";
      const top = document.createElement("div");
      top.className = "record-top";
      top.append(safeText("h3", item.titulo));
      const status = safeText("span", item.status, "status");
      top.append(status);
      card.append(top);
      if (item.local) card.append(safeText("p", "Local: " + item.local, "record-meta"));
      if (item.descricao) card.append(safeText("p", item.descricao, "record-description"));
      const date = new Date(item.created_at);
      card.append(safeText("small", "Criada em " + date.toLocaleString("pt-BR"), "record-date"));

      const controls = document.createElement("div");
      controls.className = "record-controls";
      const select = document.createElement("select");
      ["Aberta", "Em andamento", "Concluída"].forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        option.selected = value === item.status;
        select.append(option);
      });
      select.setAttribute("aria-label", "Alterar situação");
      select.addEventListener("change", async () => {
        select.disabled = true;
        const { error } = await supabaseClient.from("ocorrencias")
          .update({ status: select.value }).eq("id", item.id);
        if (error) {
          alert("Não foi possível atualizar: " + error.message);
          select.value = item.status;
        } else {
          item.status = select.value;
          status.textContent = item.status;
        }
        select.disabled = false;
      });
      const del = safeText("button", "Excluir", "button button-danger button-small");
      del.type = "button";
      del.addEventListener("click", async () => {
        if (!confirm("Deseja realmente excluir esta ocorrência?")) return;
        del.disabled = true;
        const { error } = await supabaseClient.from("ocorrencias").delete().eq("id", item.id);
        if (error) {
          alert("Não foi possível excluir: " + error.message);
          del.disabled = false;
        } else {
          card.remove();
          if (!records.querySelector(".record-card")) {
            records.append(safeText("p", "Nenhuma ocorrência cadastrada.", "empty-state"));
          }
        }
      });
      controls.append(select, del);
      card.append(controls);
      records.append(card);
    });
  }

  if (!configured) {
    message(authMessage, "Configuração pendente: preencha SUPABASE_URL e SUPABASE_ANON_KEY no arquivo src/config.js.", true);
    authSubmit.disabled = true;
    toggleAuth.disabled = true;
    return;
  }
  if (!window.supabase || !window.supabase.createClient) {
    message(authMessage, "Não foi possível carregar a biblioteca Supabase. Verifique sua conexão.", true);
    return;
  }

  supabaseClient = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  toggleAuth.addEventListener("click", () => {
    isSignup = !isSignup;
    authSubmit.textContent = isSignup ? "Criar conta" : "Entrar";
    toggleAuth.textContent = isSignup ? "Já tem conta? Entrar" : "Ainda não tem acesso? Criar conta";
    $("password").setAttribute("autocomplete", isSignup ? "new-password" : "current-password");
    authMessage.textContent = "";
  });

  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    authSubmit.disabled = true;
    message(authMessage, isSignup ? "Criando conta..." : "Entrando...");
    const email = $("email").value.trim();
    const password = $("password").value;
    let result;
    if (isSignup) {
      result = await supabaseClient.auth.signUp({ email, password });
      if (!result.error) {
        message(authMessage, "Conta criada. Se a confirmação por e-mail estiver habilitada, confirme o endereço antes de entrar.");
      }
    } else {
      result = await supabaseClient.auth.signInWithPassword({ email, password });
    }
    if (result.error) message(authMessage, result.error.message, true);
    authSubmit.disabled = false;
  });

  $("occurrenceForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = event.submitter;
    submit.disabled = true;
    message(formMessage, "Salvando...");
    const payload = {
      titulo: $("title").value.trim(),
      local: $("location").value.trim() || null,
      status: $("status").value,
      descricao: $("description").value.trim() || null
    };
    const { error } = await supabaseClient.from("ocorrencias").insert(payload);
    if (error) {
      message(formMessage, "Erro ao salvar: " + error.message, true);
    } else {
      $("occurrenceForm").reset();
      $("status").value = "Aberta";
      message(formMessage, "Ocorrência salva com sucesso.");
      await loadRecords();
    }
    submit.disabled = false;
  });

  $("refreshBtn").addEventListener("click", loadRecords);
  logoutBtn.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    showUnauthenticated();
  });

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (session?.user) showAuthenticated(session.user);
    else showUnauthenticated();
  });

  supabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) showAuthenticated(session.user);
    else showUnauthenticated();
  });
})();
