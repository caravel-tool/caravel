require "yaml"
require "process"

require "../helpers/messages"
require "../helpers/config"

module CheckCommand
  def run
    Messages.log("------------")
    self.clone_repo?()
    self.check_updates()
    self.recursive() if flags.is_recursive
  end

  def clone_repo?
    config = self.get_config()
    branch = self.get_branch()
    work_path = self.get_work_path()
    repo_path = self.get_repo_path()

    Process.new("mkdir", [".caravel__#{config.name}"]).wait if !Dir.exists?(work_path)

    
    if !Dir.exists?(repo_path)
      Dir.cd(work_path) do
        read_output = IO::Memory.new
        Messages.log("Cloning repo...")
        Process.new("git", ["clone", "-b", branch, "--single-branch", "--depth=1", config.repo, "repo"]).wait
        Dir.cd(repo_path) do
          Process.new("git", ["log", "origin/#{branch}"], output: read_output).wait
        end
        file = File.new("local_commit_hash.txt", "w")
        file.puts(read_output.to_s()[7..40].strip())
        file.close()
      end
    end

    self.run_tasks()
  end

  def check_updates
    config = self.get_config()
    repo_path = self.get_repo_path()
    branch = config.branch || "master"
    local_commit_hash = File.read("#{self.get_work_path()}/local_commit_hash.txt").strip()
    read_output = IO::Memory.new

    Dir.cd(repo_path) do
      Messages.log("Checking for updates...")
      Process.new("git", ["pull"]).wait
      Process.new("git", ["log", "origin/#{branch}"], output: read_output).wait
    end

    new_commit_hash = read_output.to_s()[7..40].strip()

    if (local_commit_hash == new_commit_hash)
      Messages.log("No updates found.")
    else
      Messages.log("Found new code. Updating...")
      work_path = self.get_work_path()
      Dir.cd(work_path) do
        file = File.new("local_commit_hash.txt", "w")
        file.puts(new_commit_hash)
        file.close()
      end
      
      self.fetch_code()
    end
  end

  def fetch_code
    config = self.get_config()
    work_path = self.get_work_path()
    branch = config.branch || "master"
    oo = IO::Memory.new

    Dir.cd(work_path) do
      Messages.log("Fetching repo code...")
      Process.new("git", ["reset", "--hard", "origin/#{branch}"]).wait
    end
   
    self.run_tasks()
  end

  def run_tasks
    Messages.log("Running tasks...")
    
    work_path = self.get_work_path()
    config = self.get_config()

    Dir.cd(work_path) do
      config.run.each do |command|
        Messages.command("Running command:", command)
        split_command = command.split(" ")
        Process.new(split_command[0], split_command[1..-1], {"CI" => "production"}).wait
      end

      Messages.log("✓ Build complete!")
    end
  end

  def validate_config_file(file : String)
    begin
      Config.from_yaml(file)
      return true
    rescue
      return false
    end
  end

  def read_config_file(file : String)
    return Config.from_yaml(file)
  end

  def get_config
    full_config_file = File.expand_path("./caravel.yml")
    return self.read_config_file(File.read(full_config_file))
  end

  def get_work_path
    config = self.get_config
    full_config_file = File.expand_path("./caravel.yml")
    full_config_path = full_config_file[0...-12]
    folder = ".caravel__#{config.name}"
    return full_work_path = "#{full_config_path}/#{folder}"
  end

  def get_repo_path
    config = self.get_config
    full_config_file = File.expand_path("./caravel.yml")
    full_config_path = full_config_file[0...-12]
    folder = ".caravel__#{config.name}"
    return full_work_path = "#{full_config_path}/#{folder}/repo"
  end

  def recursive
    sleep(10)
    self.run()
  end

  def get_branch
    config = self.get_config
    return branch = config.branch || "master"
  end
end