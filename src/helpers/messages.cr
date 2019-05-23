require "colorize"

module Messages
  extend self
  
  def log(message : String)
    puts "#{"[Caravel]".colorize(:magenta)} #{message}"
  end

  def command(message : String, command : String)
    puts "#{"[Caravel]".colorize(:magenta)} #{message} #{command.colorize(:cyan)}"
  end

  module Error
    extend self
    
    def file_not_found
      puts ""
      puts ""
      puts "Could not find #{"caravel.yml".colorize(:magenta)} in this directory."
      puts ""
      puts ""
    end

    def config_invalid(missing : String = "values")
      puts ""
      puts ""
      puts "Your #{"caravel.yml".colorize(:magenta)} config is missing #{missing}."
      puts ""
      puts "Obligaroty values are:"
      puts ""
      puts "  name".colorize(:magenta)
      puts "  e.g. name: my-website"
      puts ""
      puts "  repo".colorize(:magenta)
      puts "  e.g. repo: git@bitbucket.org:user/my-website.git"
      puts ""
      puts "  run".colorize(:magenta)
      puts "  e.g. run:"
      puts "         - npm install"
      puts "         - npm run build"
      puts ""
      puts ""
    end
  end
end