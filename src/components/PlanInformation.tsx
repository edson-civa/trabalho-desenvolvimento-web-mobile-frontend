export default function PlanInformation() {
    const information = [
        { title: 'Catálogo definido', description: 'Os jogos de cada plano são definidos pelo administrador. O acesso é temporário, durante os 30 dias de validade.' },
        { title: 'Compras na biblioteca', description: 'Os jogos comprados permanecem na sua biblioteca após o fim da assinatura.' },
        { title: 'Descontos nos jogos vinculados', description: 'O desconto vale apenas nos jogos do plano. Não acumula com promoções: aplica-se o maior desconto.' },
        { title: 'Validade da assinatura', description: 'A assinatura termina após 30 dias. Não há renovação automática.' },
    ];

    return (
        <section className="border border-body-subtle rounded-4 p-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }} aria-labelledby="plans-information-title">
            <h2 id="plans-information-title" className="fs-5 fw-bold mb-4">Como funciona</h2>
            <div className="row g-4">
                {information.map((item) => (
                    <div key={item.title} className="col-12 col-md-6">
                        <h3 className="small fw-semibold mb-2">{item.title}</h3>
                        <p className="small text-body-secondary mb-0">{item.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
