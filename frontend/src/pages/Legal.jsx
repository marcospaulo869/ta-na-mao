import React from "react";
import { Link } from "react-router-dom";
import { CaretLeft } from "@phosphor-icons/react";

export function Privacidade() {
  return (
    <LegalShell title="Política de Privacidade" testid="privacy-page">
      <p><strong>Última atualização:</strong> 26 de janeiro de 2026</p>

      <p>
        A operadora do <strong>Tá Na Mão</strong>, com sede fiscal em Torres/RS,
        respeita sua privacidade. Esta política explica como o aplicativo
        <em> Tá Na Mão</em> coleta, usa e protege seus dados.
      </p>

      <h2>1. Dados que coletamos</h2>
      <ul>
        <li><strong>Cadastro:</strong> nome, e-mail, senha criptografada (ou perfil Google).</li>
        <li><strong>Uso:</strong> medidas de ambientes, fotos capturadas, dados de projetos.</li>
        <li><strong>Pagamento:</strong> processado pela Stripe — não armazenamos dados de cartão.</li>
        <li><strong>Técnicos:</strong> IP, tipo de dispositivo, navegador (para segurança e melhorias).</li>
      </ul>

      <h2>2. Como usamos seus dados</h2>
      <ul>
        <li>Autenticar seu acesso ao aplicativo.</li>
        <li>Armazenar suas paredes, projetos e fotos para você consultar depois.</li>
        <li>Processar áudio de ditado por voz via serviços de IA (OpenAI Whisper).</li>
        <li>Cobrar pagamentos via Stripe (planos PRO).</li>
        <li>Enviar comunicados operacionais (fatura, alterações no serviço).</li>
      </ul>

      <h2>3. Compartilhamento com terceiros</h2>
      <p>
        Trabalhamos apenas com parceiros essenciais e comprometidos com a LGPD:
      </p>
      <ul>
        <li><strong>Stripe</strong> (processamento de pagamento) — dados de compra.</li>
        <li><strong>OpenAI</strong> (transcrição de voz e extração de dados) — apenas
        áudio enviado e transcrição gerada, sem identificação pessoal.</li>
        <li><strong>Google Cloud / MongoDB Atlas</strong> (armazenamento seguro).</li>
      </ul>
      <p>Nunca vendemos ou alugamos seus dados.</p>

      <h2>4. Seus direitos (LGPD)</h2>
      <p>Você pode, a qualquer momento:</p>
      <ul>
        <li>Acessar, corrigir ou excluir seus dados.</li>
        <li>Cancelar a assinatura (efeito imediato ou fim do ciclo, sua escolha).</li>
        <li>Solicitar portabilidade dos dados.</li>
        <li>Retirar consentimento — nesse caso, sua conta é encerrada.</li>
      </ul>
      <p>
        Para exercer qualquer direito, entre em contato pelo e-mail
        <strong> contato@tanamao.app</strong>.
      </p>

      <h2>5. Segurança</h2>
      <p>
        Usamos HTTPS em todo o tráfego, cookies httpOnly, senhas com bcrypt e
        acesso restrito por token de sessão. Backups diários criptografados.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Utilizamos cookies estritamente necessários para manter você logado
        (session_token) e um cookie do PostHog para análise agregada de uso
        (não pessoalmente identificável).
      </p>

      <h2>7. Retenção</h2>
      <p>
        Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão da
        conta, dados pessoais são apagados em até 30 dias (exceto o mínimo
        exigido pela legislação fiscal).
      </p>

      <h2>8. Menores de idade</h2>
      <p>
        Este aplicativo é destinado a profissionais adultos. Não coletamos
        conscientemente dados de menores de 18 anos.
      </p>

      <h2>9. Alterações nesta política</h2>
      <p>
        Qualquer mudança será notificada por e-mail e destacada aqui.
      </p>

      <h2>10. Contato</h2>
      <p>
        Tá Na Mão<br />
        Torres/RS<br />
        E-mail: <strong>contato@tanamao.app</strong>
      </p>
    </LegalShell>
  );
}

export function Termos() {
  return (
    <LegalShell title="Termos de Uso" testid="terms-page">
      <p><strong>Última atualização:</strong> 26 de janeiro de 2026</p>

      <p>
        Bem-vindo ao <strong>Tá Na Mão</strong>. Ao criar uma conta e usar o serviço,
        você concorda com estes termos.
      </p>

      <h2>1. Serviço</h2>
      <p>
        O aplicativo permite capturar medidas de ambientes, gerar relatórios em
        PDF e exportar modelos 3D para o SketchUp.
      </p>

      <h2>2. Conta</h2>
      <ul>
        <li>Você é responsável pela segurança da sua senha.</li>
        <li>Uma conta é individual e intransferível.</li>
        <li>Podemos suspender contas em caso de uso indevido ou abuso.</li>
      </ul>

      <h2>3. Planos e cobrança</h2>
      <ul>
        <li><strong>Grátis:</strong> até 10 paredes salvas.</li>
        <li><strong>PRO Mensal:</strong> R$ 39,90/mês — paredes ilimitadas.</li>
        <li><strong>PRO Anual:</strong> R$ 399,00/ano — paredes ilimitadas + ~2 meses grátis.</li>
        <li>Cobrança automática via Stripe. Cancelamento a qualquer momento.</li>
        <li>NF emitida pela operadora do serviço conforme legislação vigente.</li>
      </ul>

      <h2>4. Uso aceitável</h2>
      <p>Você concorda em NÃO:</p>
      <ul>
        <li>Compartilhar sua conta com terceiros.</li>
        <li>Usar o serviço para atividades ilegais.</li>
        <li>Tentar acessar dados de outros usuários.</li>
        <li>Fazer engenharia reversa ou copiar o código do aplicativo.</li>
      </ul>

      <h2>5. Limitação de responsabilidade</h2>
      <p>
        O aplicativo é fornecido "como está". Não nos responsabilizamos por:
      </p>
      <ul>
        <li>Erros de medida que resultem em prejuízo ao usuário — cabe ao
        profissional revisar as medidas antes de executar o projeto.</li>
        <li>Interrupções temporárias no serviço.</li>
        <li>Perda de dados por uso indevido.</li>
      </ul>

      <h2>6. Propriedade intelectual</h2>
      <p>
        O código, design, marca e conteúdo do aplicativo são propriedade da
        operadora do Tá Na Mão. Você mantém propriedade dos seus dados
        (projetos, medidas, fotos).
      </p>

      <h2>7. Cancelamento</h2>
      <p>
        Você pode cancelar sua assinatura a qualquer momento. O acesso PRO
        continua até o fim do ciclo já pago. Não há reembolso proporcional
        (exceto por exigência legal).
      </p>

      <h2>8. Foro</h2>
      <p>
        Fica eleito o foro da Comarca de Torres/RS para dirimir controvérsias
        oriundas destes termos.
      </p>

      <h2>9. Contato</h2>
      <p>
        Tá Na Mão<br />
        E-mail: <strong>contato@tanamao.app</strong>
      </p>
    </LegalShell>
  );
}

function LegalShell({ title, children, testid }) {
  return (
    <div className="min-h-screen tmf-grid-bg" data-testid={testid}>
      <header className="border-b border-[rgba(243,229,171,0.15)] bg-[rgba(10,10,8,0.85)] backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-[#f3e5ab] hover:text-[#d4af37] transition-colors"
          >
            <CaretLeft size={18} weight="bold" />
            <span className="tmf-mono text-xs uppercase tracking-widest">Voltar</span>
          </Link>
          <div className="tmf-heading text-lg tmf-gold-text">TÁ NA MÃO</div>
          <div className="w-16" />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-10">
        <h1 className="tmf-heading text-3xl text-white uppercase mb-6">{title}</h1>
        <div
          className="text-[#c8c8be] text-sm leading-relaxed space-y-4"
          style={{ lineHeight: 1.7 }}
        >
          <style>{`
            [data-testid="${testid}"] main h2 {
              color: #d4af37;
              font-family: 'Archivo Black', sans-serif;
              text-transform: uppercase;
              font-size: 1rem;
              letter-spacing: 0.02em;
              margin-top: 1.6rem;
              margin-bottom: 0.4rem;
            }
            [data-testid="${testid}"] main ul {
              list-style: disc;
              padding-left: 1.2rem;
              margin: 0.4rem 0;
            }
            [data-testid="${testid}"] main strong { color: #f3e5ab; }
            [data-testid="${testid}"] main em { color: #d4af37; font-style: italic; }
          `}</style>
          {children}
        </div>
        <div className="mt-10 pt-6 border-t border-[rgba(243,229,171,0.15)] text-center">
          <div className="tmf-mono text-[9px] tracking-[0.35em] text-[#a3a39a]">
            TÁ NA MÃO · MEDIDAS · 3D · MARCENARIA
          </div>
        </div>
      </main>
    </div>
  );
}
