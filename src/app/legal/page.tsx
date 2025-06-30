export default function LegalPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-10 md:mt-20 mt-[35vh]">
      {/* Politique de Confidentialité */}
      <section>
        <h1 className="text-3xl font-bold mb-4">
          Politique de confidentialité
        </h1>
        <p className="mb-4">Dernière mise à jour : 25 juin 2025</p>
        <p className="mb-4">
          Tuulo (« nous », « notre », « nos ») accorde une grande importance à
          la protection de vos données personnelles. Cette politique explique
          quelles données nous collectons, comment nous les utilisons, et quels
          sont vos droits en vertu du RGPD.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-2">
          1. Responsable du traitement
        </h2>
        <p className="mb-4">
          Tuulo
          <br />
          [Nom du porteur de projet]
          <br />
          Email : contact@tuulo.app
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-2">
          2. Données collectées
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>Nom, prénom, email</li>
          <li>Contenu partagé sur la plateforme</li>
          <li>Données techniques (cookies, IP, navigateur)</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-6 mb-2">3. Finalités</h2>
        <p className="mb-4">
          Authentification, personnalisation, sécurité, communication,
          statistiques.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-2">
          4. Droits des utilisateurs
        </h2>
        <p className="mb-4">
          Accès, rectification, suppression, portabilité. Contact :
          contact@tuulo.app
        </p>
      </section>

      {/* Mentions Légales */}
      <section>
        <h1 className="text-3xl font-bold mb-4">Mentions légales</h1>
        <p className="mb-4">
          Conformément à la loi française n°2004-575 du 21 juin 2004 pour la
          confiance dans l&apos;économie numérique :
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-2">Éditeur du site</h2>
        <p className="mb-4">
          Tuulo
          <br />
          [Nom du porteur de projet]
          <br />
          Email : contact@tuulo.app
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-2">Hébergeur</h2>
        <p className="mb-4">
          [Nom de l&apos;hébergeur]
          <br />
          Adresse complète
          <br />
          Téléphone / site web
        </p>
      </section>

      {/* Conditions Générales d’Utilisation */}
      <section>
        <h1 className="text-3xl font-bold mb-4">
          Conditions Générales d&apos;Utilisation (CGU)
        </h1>
        <h2 className="text-2xl font-semibold mt-6 mb-2">1. Objet</h2>
        <p className="mb-4">
          Les présentes CGU ont pour objet l&apos;encadrement juridique de
          l&apos;utilisation de Tuulo.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-2">
          2. Accès au service
        </h2>
        <p className="mb-4">
          Tuulo est accessible gratuitement à tout utilisateur disposant
          d&apos;un accès à Internet.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-2">3. Comportement</h2>
        <p className="mb-4">
          L&apos;utilisateur s&apos;engage à ne pas publier de contenu illicite,
          haineux ou violent.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-2">4. Responsabilité</h2>
        <p className="mb-4">
          Tuulo ne peut être tenu responsable des dommages indirects causés par
          l&apos;utilisation du service.
        </p>
      </section>

      {/* Politique de Cookies */}
      <section>
        <h1 className="text-3xl font-bold mb-4">Politique de cookies</h1>
        <p className="mb-4">
          Notre site utilise des cookies pour améliorer votre expérience
          utilisateur.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-2">
          1. Qu&apos;est-ce qu&apos;un cookie ?
        </h2>
        <p className="mb-4">
          Un cookie est un fichier texte stocké sur votre navigateur lors de
          votre visite.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-2">2. Utilisation</h2>
        <ul className="list-disc list-inside mb-4">
          <li>Cookies techniques nécessaires au bon fonctionnement</li>
          <li>Cookies de mesure d&apos;audience anonymes</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-6 mb-2">3. Consentement</h2>
        <p className="mb-4">
          Vous pouvez accepter ou refuser les cookies via notre bannière dédiée.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-2">4. Gestion</h2>
        <p className="mb-4">
          Vous pouvez désactiver les cookies dans les paramètres de votre
          navigateur.
        </p>
      </section>
    </main>
  );
}
