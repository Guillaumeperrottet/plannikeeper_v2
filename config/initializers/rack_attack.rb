class Rack::Attack
  # Bloque les requêtes essayant d'accéder à des fichiers sensibles
  BLOCKED_PATHS = %w[
    /.env /api/.env /phpinfo.php /phpinfo /.env.save
    /wp-json/wp/v2/users/ /_profiler/phpinfo /application/.env
    /local/.env /admin/.env /dev/.env
  ]

  Rack::Attack.blocklist('block scanners') do |req|
    BLOCKED_PATHS.include?(req.path)
  end

  # Bloque les IPs après trop de requêtes en peu de temps (anti-DDOS)
  throttle('req/ip', limit: 5, period: 5.seconds) do |req|
    req.ip
  end
end
