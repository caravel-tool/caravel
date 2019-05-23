require "cli"

class Polygon < Cli::Supercommand
  command "triangle", default: true

  class Triangle < Cli::Command
    def run
      puts 3
    end
  end

  class Square < Cli::Command
    def run
      puts 4
    end
  end

  class Hexagon < Cli::Command
    def run
      puts 6
    end
  end
end