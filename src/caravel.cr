require "admiral"
require "colorize"

require "./commands/*"

class HelloWorld < Admiral::Command
  class Start < Admiral::Command
    include StartCommand
  end

  class Check < Admiral::Command
    define_flag(is_recursive : Bool, long: recursive, default: false)
    include CheckCommand
  end

  class Help < Admiral::Command
    include HelpCommand
  end

  register_sub_command help : Help, "Help"
  register_sub_command start : Start, "Start"
  register_sub_command check : Check, "Check"

  def run
    puts ""
    puts ""
    puts "   Caravel can't recognize this command."
    puts "   Run #{"caravel help".colorize(:magenta)} for instructions."
    puts ""
    puts ""
  end
end

HelloWorld.run