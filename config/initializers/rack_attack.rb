class Rack::Attack
  Rack::Attack.blocklist('block scanners') do |req|
    paths = ["/telescope/requests", "/info.php", "/phpinfo.php", "/.env", "/api/.env", "/wp-json/wp/v2/users/"]
    paths.include?(req.path)
  end
end
