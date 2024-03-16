---
layout: post
title: Configuring a new laptop
image: /images/configuring_laptop/laptop.webp
image-alt: A sleek, modern laptop with a glossy screen, open on a minimalist desk. The desk is wooden, clean, and there's a small potted plant to the side. Soft, ambient lighting creates a cozy atmosphere. The laptop screen displays a vibrant wallpaper with abstract geometric shapes in blue and green hues. The scene suggests innovation, productivity, and modern technology. The background is softly blurred, emphasizing the laptop and the work environment.
comments: false
last_modified_at: 2024-03-16 12:33:00 -0800
---

This post is mostly for my future self, but others may find it useful. It assumes a Windows machine (😱), with most development work done in WSL 2.

## General

- Replace the preinstalled antivirus trial with something legitimate. If you don't do this first the popups will drive you insane.

- Uninstall bloatware, trials, games, etc.

- Disable personalization and related 'features'

- Disable unnecessary programs at startup in Task Manager

## Windows programs:

- Inkscape
- paint.net
- Brave
- Docker desktop
- VS Code - use Settings Sync to easily port entire setup (extensions, keybindings, fonts, etc.) to a new machine or Codespaces
- Alacritty - modern terminal emulator, configured for WSL 2 as follows in the file `%APPDATA%\alacritty\alacritty.toml`:

{% highlight  toml %}
[shell]
args = ["--cd ~"]
program = "wsl"
{% endhighlight %}

## Software dev

### First things first

Install WSL2 using PowerShell as an administrator:
{% highlight  bash %}
wsl --install -d Ubuntu-22.04
{% endhighlight %}

On WSL2:
{% highlight  bash %}
sudo apt update
sudo apt upgrade
sudo apt install ripgrep tree tmux
{% endhighlight %}

### ssh, gpg, and git

Generate a GPG key for signing commits:

{% highlight  bash %}
gpg --full-generate-key
{% endhighlight %}

WSL 2 needed the following added to `~/.profile` to avoid the error `gpg failed to sign the data`:
{% highlight  bash %}
export GPG_TTY=$(tty)
{% endhighlight %}

Configure git:

{% highlight  bash %}
git config --global user.email "<github_username>@users.noreply.github.com"
git config --global user.name "<name>"
git config --global core.editor vim
git config --global commit.gpgsign true
gpg --list-secret-keys --keyid-format=long
{% endhighlight %}

Now use signing key from above command:
{% highlight  bash %}
git config --global user.signingkey <16 character key>
{% endhighlight %}

Create an ssh key for GitHub:

{% highlight  bash %}
ssh-keygen -t ed25519 -C "<github_username>@users.noreply.github.com"
{% endhighlight %}

### Developer experience

- [starship](https://starship.rs/) - fast and useful prompt e.g. displays current git branch and Node version
- [fzf](https://github.com/junegunn/fzf) - fast finding. I suggest installing with `git` since package manager versions can be quite outdated. Enable key bindings.
- [ripgrep](https://github.com/BurntSushi/ripgrep) - rust alternative of `grep`, installed in command above
- [nvm](https://github.com/nvm-sh/nvm) - install and switch between multiple `node` environments seamlessly
- [miniforge](https://github.com/conda-forge/miniforge) - python package manager without the environment solving issues. Bonus tip: use `mamba` instead of `conda`.
- [My own vim preferences](https://github.com/dcroote/vimrc)
- [gitalias](https://github.com/GitAlias/gitalias) simplifies git e.g. `git c` instead of `git commit` and `git s` instead of `git status`. It might seem unimportant, but the frequency with which these commands are used can accrue nontrivial time and keystroke savings. There are also handy aliases for when you find yourself in some weird merge hell and need to torch everything and reset to upstream / pristine.

{% highlight  bash %}
curl https://raw.githubusercontent.com/GitAlias/gitalias/main/gitalias.txt -o ~/.gitalias.txt
git config --global include.path ~/.gitalias.txt
{% endhighlight %}

`.bashrc` aliases and exports. At a bare minimum, for me:

{% highlight  bash %}
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias v="vim"
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
{% endhighlight %}

Let me know if there is anything I missed!
