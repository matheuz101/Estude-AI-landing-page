/* EstudeAI — JavaScript vanilla, sem dependências de execução. */
const EstudeAI = (() => {
  "use strict";

  const questions = [
    {
      text: "Em uma cadeia alimentar, qual é o papel dos organismos decompositores?",
      options: ["Produzir matéria orgânica a partir da luz.", "Reciclar nutrientes da matéria orgânica.", "Consumir exclusivamente produtores."],
      answer: 1,
      explanation: "Decompositores transformam matéria orgânica e devolvem nutrientes ao ambiente."
    },
    {
      text: "Um produto de R$ 200 recebeu um desconto de 15%. Qual é o novo preço?",
      options: ["R$ 185", "R$ 170", "R$ 150"],
      answer: 1,
      explanation: "15% de R$ 200 são R$ 30. O novo preço é R$ 200 − R$ 30 = R$ 170."
    },
    {
      text: "Qual frase apresenta uma relação de causa e consequência?",
      options: ["Estudei pela manhã e caminhei à tarde.", "Embora estivesse frio, saí de casa.", "Como choveu muito, a rua ficou alagada."],
      answer: 2,
      explanation: "A chuva é a causa; o alagamento é a consequência."
    }
  ];

  const levels = [
    { kicker: "NÍVEL 01 · CONSTRUA SUA BASE", title: "Comece com espaço.", description: "Um ambiente controlado, sem pressão adicional e com tempo confortável para recuperar o conteúdo e ganhar familiaridade com o treino.", time: "Sem limite de tempo", focus: "Foco em conhecimento e confiança", duration: null },
    { kicker: "NÍVEL 02 · ENCONTRE SUA CADÊNCIA", title: "Entre no ritmo.", description: "Limites de tempo entram em cena, com espaço para você se adaptar e descobrir seu ritmo de resolução.", time: "Tempo sugerido por questão", focus: "Foco em gestão de tempo", duration: 90 },
    { kicker: "NÍVEL 03 · AJUSTE SUA EXECUÇÃO", title: "Pratique sob pressão.", description: "Menos tempo disponível e condições mais exigentes aproximam o treino do desafio real, para você observar suas decisões sob pressão.", time: "Tempo total mais desafiador", focus: "Foco em decisão e consistência", duration: 60 },
    { kicker: "NÍVEL 04 · APROXIME-SE DA PROVA", title: "Viva a simulação.", description: "Uma experiência baseada nas condições do exame escolhido: duração, sequência e ritmo. Na demonstração, experimente 3 questões em 45 segundos.", time: "Condições do exame escolhido", focus: "Foco em execução completa", duration: 45 }
  ];

  const periods = {
    week: { accuracy: 82, time: [1, 42], pressure: 74, hesitation: 6, accuracyChange: "↗ 8 p.p. na semana", timeChange: "18s mais rápido", pressureChange: "↗ 6 p.p. na semana", hesitationChange: "Em 20 questões", growth: "+12 p.p.", bars: [91, 87, 72], points: [104, 93, 104, 64, 53, 60], title: "Exemplo de evolução: de 70% a 82% em seis sessões.", insight: "Neste exemplo, o desempenho se mantém nos primeiros 35 minutos, mas cai quando resta menos de 20% do tempo. O próximo treino pode focar na gestão do ritmo." },
    month: { accuracy: 87, time: [1, 28], pressure: 81, hesitation: 4, accuracyChange: "↗ 12 p.p. no mês", timeChange: "32s mais rápido", pressureChange: "↗ 13 p.p. no mês", hesitationChange: "Em 20 questões", growth: "+17 p.p.", bars: [94, 90, 81], points: [104, 89, 75, 56, 45, 41], title: "Exemplo de evolução: de 70% a 87% em seis sessões.", insight: "Nesta série ilustrativa, o tempo médio caiu 32 segundos e a precisão sob alta pressão chegou a 81%. A comparação entre sessões ajuda a observar a consistência, além da velocidade." }
  };

  function formatDuration(seconds) {
    const value = Math.max(0, Math.ceil(Number(seconds) || 0));
    return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  }

  function remainingSeconds(startedAt, now, duration) {
    return duration === null ? null : Math.max(0, Math.ceil(duration - Math.max(0, now - startedAt) / 1000));
  }

  function summarizeSession(attempts, total = questions.length) {
    const answered = attempts.filter(attempt => Number.isInteger(attempt.selected));
    const correct = answered.filter(attempt => attempt.selected === questions[attempt.index]?.answer).length;
    const time = attempts.reduce((sum, attempt) => sum + Math.max(0, attempt.seconds || 0), 0);
    return {
      correct,
      answered: answered.length,
      skipped: Math.max(0, total - answered.length),
      accuracy: total > 0 ? Math.round(correct / total * 100) : 0,
      average: attempts.length ? Math.round(time / attempts.length) : 0,
      changes: attempts.reduce((sum, attempt) => sum + Math.max(0, attempt.changes || 0), 0)
    };
  }

  function init() {
    const $ = selector => document.querySelector(selector);
    const $$ = selector => [...document.querySelectorAll(selector)];
    const menu = $("#main-nav");
    const menuToggle = $(".menu-toggle");
    const header = $(".site-header");
    const demoDialog = $("#demo-dialog");
    let timerId = null;
    let session = null;

    function closeMenu(returnFocus = false) {
      menu.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
      if (returnFocus) menuToggle.focus();
    }

    menuToggle.addEventListener("click", () => {
      const opened = menu.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(opened));
      menuToggle.setAttribute("aria-label", opened ? "Fechar menu" : "Abrir menu");
    });
    menu.addEventListener("click", event => {
      if (event.target.closest("a, button")) closeMenu();
    });
    document.addEventListener("click", event => {
      if (!header.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) closeMenu(true);
    });
    window.matchMedia("(min-width: 901px)").addEventListener("change", event => {
      if (event.matches) closeMenu();
    });
    function updateHeader() { header.classList.toggle("scrolled", window.scrollY > 12); }
    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();

    // Progressive enhancement preserves the content if observation is unavailable.
    if ("IntersectionObserver" in window) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduceMotion) {
        const revealObserver = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.remove("is-pending");
            revealObserver.unobserve(entry.target);
          });
        }, { threshold: 0.08 });
        $$(".reveal").forEach(element => {
          if (element.getBoundingClientRect().top <= window.innerHeight) return;
          element.classList.add("is-pending");
          revealObserver.observe(element);
        });
      }
      const navObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          $$(".main-nav > a").forEach(link => {
            const active = link.hash === `#${entry.target.id}`;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      }, { rootMargin: "-15% 0px -65% 0px", threshold: 0 });
      $$("main section[id]").forEach(section => navObserver.observe(section));
    }

    $$(".sample-answer").forEach(button => {
      button.addEventListener("click", () => {
        $$(".sample-answer").forEach(answer => {
          const selected = answer === button;
          answer.classList.toggle("is-selected", selected);
          answer.setAttribute("aria-pressed", String(selected));
        });
      });
    });

    function selectLevel(index, focus = false) {
      const level = levels[index];
      $$("[data-level]").forEach((button, buttonIndex) => {
        const active = buttonIndex === index;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
        if (active && focus) button.focus();
      });
      $("#level-panel").setAttribute("aria-labelledby", `level-tab-${index + 1}`);
      $("#level-kicker").textContent = level.kicker;
      $("#level-title").textContent = level.title;
      $("#level-description").textContent = level.description;
      $("#level-time").textContent = level.time;
      $("#level-focus").textContent = level.focus;
      $("#demo-level").value = String(index);
      $$(".level-meter i").forEach((bar, barIndex) => bar.classList.toggle("filled", barIndex <= index));
    }
    $$("[data-level]").forEach(button => {
      button.addEventListener("click", () => selectLevel(Number(button.dataset.level)));
      button.addEventListener("keydown", event => {
        let next = Number(button.dataset.level);
        if (event.key === "ArrowRight") next = (next + 1) % levels.length;
        else if (event.key === "ArrowLeft") next = (next + levels.length - 1) % levels.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = levels.length - 1;
        else return;
        event.preventDefault();
        selectLevel(next, true);
      });
    });

    function changePeriod(period) {
      const data = periods[period];
      $$("[data-period]").forEach(button => {
        const active = button.dataset.period === period;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      $("#stat-accuracy").innerHTML = `${data.accuracy}<small>%</small>`;
      $("#stat-time").innerHTML = `${data.time[0]}<small>m</small> ${data.time[1]}<small>s</small>`;
      $("#stat-pressure").innerHTML = `${data.pressure}<small>%</small>`;
      $("#stat-hesitation").textContent = data.hesitation;
      ["accuracy", "time", "pressure", "hesitation"].forEach(key => { $(`#stat-${key}-change`).textContent = data[`${key}Change`]; });
      $("#chart-growth").textContent = data.growth;
      $("#dashboard-insight-text").textContent = data.insight;
      $$(".bar").forEach((bar, index) => {
        bar.style.setProperty("--bar", `${data.bars[index]}%`);
        bar.querySelector("strong").textContent = `${data.bars[index]}%`;
      });
      $(".bar-chart").setAttribute("aria-label", `Baixa pressão: ${data.bars[0]}%. Pressão moderada: ${data.bars[1]}%. Alta pressão: ${data.bars[2]}%.`);
      const x = [48, 120, 194, 266, 340, 414];
      const path = data.points.map((y, index) => `${index === 0 ? "M" : "L"}${x[index]} ${y}`).join(" ");
      $("#evolution-line").setAttribute("d", path);
      $("#evolution-area").setAttribute("d", `${path} V151 H48Z`);
      $("#evolution-title").textContent = data.title;
      $$("#evolution-points circle").forEach((circle, index) => circle.setAttribute("cy", data.points[index]));
    }
    $$("[data-period]").forEach(button => button.addEventListener("click", () => changePeriod(button.dataset.period)));

    function stopTimer() {
      if (timerId !== null) window.clearInterval(timerId);
      timerId = null;
    }

    function resetDemo() {
      stopTimer();
      session = null;
      $("#demo-setup").hidden = false;
      $("#demo-active").hidden = true;
      $("#demo-result").hidden = true;
      $("#demo-result").replaceChildren();
      $("#demo-heading").innerHTML = "Um pequeno treino.<br>Uma nova perspectiva.";
      $(".demo-intro").hidden = false;
    }

    function openDialog(id) {
      $$("dialog[open]").forEach(dialog => dialog.close());
      closeMenu();
      if (id === "demo-dialog") resetDemo();
      const dialog = document.getElementById(id);
      if (!dialog) return;
      dialog.showModal();
      document.body.classList.add("modal-open");
    }

    $$("dialog").forEach(dialog => {
      dialog.addEventListener("click", event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
      });
      dialog.addEventListener("close", () => {
        if (dialog === demoDialog) stopTimer();
        if (!$("dialog[open]")) document.body.classList.remove("modal-open");
      });
    });

    const infoContent = {
      contact: { title: "Vamos conversar.", paragraphs: ["O canal oficial de contato será divulgado no lançamento da plataforma.", "Enquanto isso, você pode conhecer a proposta e experimentar o treino disponível nesta página."] },
      instagram: { title: "Em breve no Instagram.", paragraphs: ["O perfil oficial da EstudeAI será divulgado aqui quando estiver disponível. Até lá, explore a demonstração para conhecer a proposta."] },
      linkedin: { title: "Em breve no LinkedIn.", paragraphs: ["A página oficial da EstudeAI será divulgada aqui no lançamento. Esta versão ainda não possui um perfil vinculado."] },
      privacy: { title: "Seus dados nesta demonstração.", paragraphs: ["O formulário não envia informações a um servidor. Nome, e-mail e objetivo são utilizados somente para exibir a confirmação na página e permanecem na memória desta sessão.", "As respostas e os tempos do treino são calculados no seu navegador. Esta página não utiliza cookies, ferramentas de rastreamento ou armazenamento persistente.", "Ao recarregar a página, o estado controlado pela demonstração é descartado. O navegador pode manter campos conforme suas próprias configurações de preenchimento automático.", "Na versão publicada, o serviço de hospedagem pode processar dados técnicos de acesso. Uma política específica para o produto será necessária antes da coleta real de cadastros."] },
      terms: { title: "Sobre esta versão.", paragraphs: ["Esta página apresenta uma demonstração educacional da EstudeAI. Os dashboards contêm exemplos fictícios e não representam resultados ou depoimentos de usuários.", "O treino de três questões serve para experimentar a interface. Não equivale a uma avaliação de preparo para exames e não inclui geração de questões por IA, envio de materiais ou autenticação.", "A proposta complementa a preparação acadêmica. Não oferece tratamento médico ou psicológico nem garante resultados em provas."] }
    };

    document.addEventListener("click", event => {
      const opener = event.target.closest("[data-open]");
      if (opener) openDialog(opener.dataset.open);
      const closer = event.target.closest("[data-close]");
      if (closer) closer.closest("dialog")?.close();
      const infoButton = event.target.closest("[data-info]");
      if (infoButton) {
        const content = infoContent[infoButton.dataset.info];
        $("#info-heading").textContent = content.title;
        $("#info-content").replaceChildren(...content.paragraphs.map(text => {
          const paragraph = document.createElement("p");
          paragraph.textContent = text;
          return paragraph;
        }));
        openDialog("info-dialog");
      }
    });

    function renderQuestion() {
      const question = questions[session.index];
      session.questionStartedAt = performance.now();
      session.selected = null;
      session.changes = 0;
      $("#demo-progress").textContent = `Questão ${session.index + 1} de ${questions.length}`;
      $("#demo-progress-bar").value = session.index;
      $("#demo-question-text").textContent = question.text;
      $("#demo-question-feedback").textContent = "";
      $("#demo-options").replaceChildren(...question.options.map((option, index) => {
        const label = document.createElement("label");
        label.className = "demo-option";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "demo-answer";
        input.value = String(index);
        input.addEventListener("change", () => {
          if (session.selected !== null && session.selected !== index) session.changes += 1;
          session.selected = index;
          $("#demo-question-feedback").textContent = "";
        });
        const text = document.createElement("span");
        text.textContent = option;
        label.append(input, text);
        return label;
      }));
      $("#demo-next").innerHTML = `${session.index === questions.length - 1 ? "Ver resultado" : "Confirmar"} <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>`;
      // Focus the question instead of preselecting an answer.
      $("#demo-question-text").tabIndex = -1;
      $("#demo-question-text").focus();
    }

    function recordAttempt(skip = false) {
      const now = performance.now();
      const deadline = session.duration === null ? now : session.startedAt + session.duration * 1000;
      session.attempts.push({ index: session.index, selected: skip ? null : session.selected, seconds: Math.max(0, Math.min(now, deadline) - session.questionStartedAt) / 1000, changes: session.changes });
    }

    function finishDemo(timedOut = false) {
      if (!session || session.finished) return;
      if (timedOut) recordAttempt();
      session.finished = true;
      stopTimer();
      const result = summarizeSession(session.attempts);
      $("#demo-active").hidden = true;
      $(".demo-intro").hidden = true;
      $("#demo-heading").innerHTML = "Um treino concluído.<br>Um ponto de partida.";
      const resultContainer = $("#demo-result");
      resultContainer.hidden = false;
      // All interpolated values below come from the fixed question bank or numeric calculations.
      resultContainer.innerHTML = `
        <p class="demo-result-copy">${timedOut ? "O tempo terminou. Cada sessão ajuda a perceber como você organiza suas decisões." : "Veja o que aconteceu enquanto você resolvia as questões."}</p>
        <div class="demo-score"><div><strong>${result.correct}/${questions.length}</strong><span>Acertos</span></div><div><strong>${formatDuration(result.average)}</strong><span>Tempo médio por questão visitada</span></div><div><strong>${result.changes}</strong><span>Trocas de resposta</span></div></div>
        <p class="demo-result-copy">Precisão: <strong>${result.accuracy}%</strong>. ${result.skipped ? `${result.skipped} questão(ões) sem resposta.` : "Você respondeu a todas as questões."} Esta amostra é curta e não permite concluir seu nível de preparação.</p>
        <ul class="result-review">${questions.map((question, index) => {
          const attempt = session.attempts.find(item => item.index === index);
          const answered = Number.isInteger(attempt?.selected);
          const correct = answered && attempt.selected === question.answer;
          const label = correct ? "Correta" : answered ? "Incorreta" : "Sem resposta";
          return `<li><strong>Questão ${index + 1} · <span class="${correct ? "result-correct" : "result-incorrect"}">${label}</span></strong><br><span>${question.explanation}</span></li>`;
        }).join("")}</ul>
        <div class="result-actions"><button class="button" id="restart-demo">Treinar novamente</button><a class="button button-ghost" href="#comecar" data-close>Conhecer a lista de espera →</a></div>`;
      $("#restart-demo").addEventListener("click", () => {
        resetDemo();
        $("#demo-level").focus();
      });
      $("#demo-heading").tabIndex = -1;
      $("#demo-heading").focus();
      demoDialog.scrollTop = 0;
    }

    function updateTimer() {
      if (!session || session.finished) return;
      const now = performance.now();
      const remaining = remainingSeconds(session.startedAt, now, session.duration);
      $("#demo-timer").textContent = remaining === null ? `${formatDuration(Math.floor((now - session.startedAt) / 1000))} · livre` : formatDuration(remaining);
      $("#demo-timer").classList.toggle("is-urgent", remaining !== null && remaining <= 15);
      if (remaining === 0) finishDemo(true);
    }

    $("#start-demo").addEventListener("click", () => {
      stopTimer();
      const level = levels[Number($("#demo-level").value)];
      session = { index: 0, selected: null, changes: 0, startedAt: performance.now(), questionStartedAt: 0, duration: level.duration, attempts: [], finished: false };
      $("#demo-setup").hidden = true;
      $("#demo-active").hidden = false;
      renderQuestion();
      updateTimer();
      timerId = window.setInterval(updateTimer, 250);
    });

    function advanceQuestion(skip = false) {
      if (!session || session.finished) return;
      // Check wall-clock time before accepting input, including after backgrounding.
      updateTimer();
      if (session.finished) return;
      if (!skip && session.selected === null) {
        $("#demo-question-feedback").textContent = "Escolha uma alternativa ou use Pular questão.";
        $("#demo-options input")?.focus();
        return;
      }
      recordAttempt(skip);
      session.index += 1;
      if (session.index >= questions.length) finishDemo();
      else renderQuestion();
    }
    $("#demo-next").addEventListener("click", () => advanceQuestion());
    $("#demo-skip").addEventListener("click", () => advanceQuestion(true));
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && demoDialog.open) updateTimer();
    });

    const waitlist = $("#waitlist-form");
    const nameInput = $("#waitlist-name");
    nameInput.addEventListener("input", () => {
      nameInput.setCustomValidity(nameInput.value.trim() ? "" : "Informe seu nome.");
    });
    waitlist.addEventListener("submit", event => {
      event.preventDefault();
      nameInput.setCustomValidity(nameInput.value.trim() ? "" : "Informe seu nome.");
      if (!waitlist.reportValidity()) return;
      const feedback = $("#waitlist-feedback");
      feedback.textContent = `${nameInput.value.trim()}, seu interesse em ${$("#waitlist-goal").value} está preparado nesta demonstração. Nenhum cadastro foi enviado. A lista de espera real será disponibilizada no lançamento.`;
      feedback.hidden = false;
      feedback.tabIndex = -1;
      feedback.focus();
    });

    // Decorative SVGs do not repeat accessible text already provided by their controls.
    $$("svg.icon").forEach(icon => icon.setAttribute("aria-hidden", "true"));
  }

  return { init, formatDuration, remainingSeconds, summarizeSession };
})();

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", EstudeAI.init, { once: true });
  else EstudeAI.init();
}
if (typeof module !== "undefined" && module.exports) module.exports = EstudeAI;
