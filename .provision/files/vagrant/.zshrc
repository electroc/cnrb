# oh my zsh
export ZSH=$HOME/.oh-my-zsh
DISABLE_AUTO_UPDATE="true"
ENABLE_CORRECTION="true"
COMPLETION_WAITING_DOTS="true"
HIST_STAMPS="yyyy-mm-dd"
plugins=(colorize nvm)
export PATH="/usr/local/bin:/usr/bin:/bin"
source $HOME/.oh-my-zsh/oh-my-zsh.sh
export LANG=de_DE.UTF-8
export EDITOR='nano'
export ARCHFLAGS="-arch x86_64"
export SSH_KEY_PATH="~/.ssh/dsa_id"
alias zshconfig="nano ~/.zshrc"

# zsh git prompt
source ~/.zsh-git-prompt/zshrc.sh

# custom prompt
PROMPT='%{%F{green}%}%n%{%f%} %B%{%F{magenta}%}%~%{%f%}%b
 %B%{%F{cyan}%}➜%{%f%}%b '
RPROMPT=''

# node version
nvm use stable

# enter project folder
cd /vagrant
