module HelpCommand
  def run
    puts ""
    puts ""
    puts "                  Caravel".colorize(:cyan)
    puts "         CI/CD for simple projects.".colorize(:cyan)
    puts ""
    puts "   Available commands:"
    puts ""
    puts "   start (default)".colorize(:magenta)
    puts "   Read ./caravel.yml and start an instance."
    puts ""
    puts "   check".colorize(:magenta)
    puts "   Fetch git URL and manually check for changes."
    puts ""
    puts "   rollback [commit]".colorize(:magenta)
    puts "   Deploy the application at a specific commit."
    puts ""
    puts "   validate [caravel.yml]".colorize(:magenta)
    puts "   Check if Caravel understands your caravel.yml."
    puts ""
    puts "   list".colorize(:magenta)
    puts "   List Caravel instances running."
    puts ""
    puts "   remove [instance-name]".colorize(:magenta)
    puts "   Stop and Delete instance."
    puts ""
    puts "   remove all".colorize(:magenta)
    puts "   Stop and Delete all instances."
    puts ""
    puts "   generate-ssh".colorize(:magenta)
    puts "   Generate SSH key so you can add it to your repo."
    puts ""
    puts ""
    puts "   For more help:"
    puts "   https://docs.caravel-ci.dev/"
    puts ""
    puts ""
  end
end
