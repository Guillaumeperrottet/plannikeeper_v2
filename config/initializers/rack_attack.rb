class Rack::Attack
  # Répond avec une erreur 403 Forbidden au lieu d’un 404
  self.blocklisted_responder = lambda do |_request|
    [403, { 'Content-Type' => 'text/plain' }, ["Access Forbidden\n"]]
  end

  # Bloque les requêtes essayant d'accéder à des fichiers sensibles
  BLOCKED_PATHS = %w[
    /.env /api/.env /phpinfo.php /phpinfo /.env.save
    /wp-json/wp/v2/users/ /_profiler/phpinfo /application/.env
    /local/.env /admin/.env /dev/.env
  ]

  Rack::Attack.blocklist('block scanners') do |req|
    BLOCKED_PATHS.include?(req.path)
  end

  # Bloque les requêtes POST non autorisées sur des chemins critiques
  Rack::Attack.blocklist('block unauthorized POST requests') do |req|
    req.post? && BLOCKED_PATHS.include?(req.path)
  end

  # Bloque les requêtes POST sur la racine "/" si non autorisées
  Rack::Attack.blocklist('block POST to root') do |req|
    req.path == "/" && req.post?
  end

  # Bloque les IPs après trop de requêtes en peu de temps (anti-DDOS)
  throttle('req/ip', limit: 5, period: 5.seconds) do |req|
    req.ip
  end
end
