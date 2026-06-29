class LinuxSimulator {
  constructor() {
    this.fs = {
      '/': { type: 'dir', children: ['home', 'etc', 'var', 'usr', 'tmp', 'bin', 'sbin', 'opt', 'proc', 'dev', 'mnt', 'media', 'srv', 'root'] },
      '/home': { type: 'dir', children: ['user'] },
      '/home/user': { type: 'dir', children: ['documents', 'downloads', 'projects', 'scripts', '.bashrc', '.profile', '.vimrc', '.gitconfig'] },
      '/home/user/documents': { type: 'dir', children: ['notes.txt', 'todo.md', 'report.docx'] },
      '/home/user/documents/notes.txt': { type: 'file', content: 'Linux 学习笔记\n================\n\n1. 文件系统操作\n2. 文本处理\n3. 进程管理\n4. 网络配置\n5. Shell 脚本' },
      '/home/user/documents/todo.md': { type: 'file', content: '# 待办事项\n\n- [x] 学习 Linux 基础命令\n- [ ] 练习文件操作\n- [ ] 学习 Shell 脚本\n- [ ] 配置网络\n- [ ] 学习 vim' },
      '/home/user/documents/report.docx': { type: 'file', content: '[binary data - Microsoft Word document]' },
      '/home/user/downloads': { type: 'dir', children: ['image.png', 'archive.tar.gz', 'setup.sh'] },
      '/home/user/downloads/image.png': { type: 'file', content: '[binary data - PNG image]' },
      '/home/user/downloads/archive.tar.gz': { type: 'file', content: '[binary data - gzip compressed]' },
      '/home/user/downloads/setup.sh': { type: 'file', content: '#!/bin/bash\necho "Installing dependencies..."\napt update\napt install -y vim git curl\necho "Done!"' },
      '/home/user/projects': { type: 'dir', children: ['hello.py', 'README.md', 'Makefile', 'src'] },
      '/home/user/projects/hello.py': { type: 'file', content: '#!/usr/bin/env python3\n"""Hello World program"""\ndef main():\n    print("Hello from GlassOS Linux!")\n    for i in range(10):\n        print(f"Count: {i}")\nif __name__ == "__main__":\n    main()' },
      '/home/user/projects/README.md': { type: 'file', content: '# My Project\n\nA sample project for learning Linux commands.\n\n## Features\n- File management\n- Text processing\n- Process control\n\n## Usage\n```bash\n$ python3 hello.py\nHello from GlassOS Linux!\n```' },
      '/home/user/projects/Makefile': { type: 'file', content: 'CC=gcc\nCFLAGS=-Wall -g\n\nall: hello\n\nhello: hello.c\n\t$(CC) $(CFLAGS) -o hello hello.c\n\nclean:\n\trm -f hello\n\n.PHONY: all clean' },
      '/home/user/projects/src': { type: 'dir', children: ['main.c', 'utils.c', 'utils.h'] },
      '/home/user/projects/src/main.c': { type: 'file', content: '#include <stdio.h>\n#include "utils.h"\n\nint main() {\n    printf("Hello, World!\\n");\n    print_system_info();\n    return 0;\n}' },
      '/home/user/projects/src/utils.c': { type: 'file', content: '#include <stdio.h>\n#include <sys/utsname.h>\n\nvoid print_system_info() {\n    struct utsname info;\n    uname(&info);\n    printf("System: %s %s\\n", info.sysname, info.release);\n}' },
      '/home/user/projects/src/utils.h': { type: 'file', content: '#ifndef UTILS_H\n#define UTILS_H\n\nvoid print_system_info();\n\n#endif' },
      '/home/user/scripts': { type: 'dir', children: ['backup.sh', 'deploy.sh', 'monitor.sh'] },
      '/home/user/scripts/backup.sh': { type: 'file', content: '#!/bin/bash\n# Backup script\ntar -czf backup_$(date +%Y%m%d).tar.gz ~/documents\necho "Backup complete!"' },
      '/home/user/scripts/deploy.sh': { type: 'file', content: '#!/bin/bash\n# Deploy script\necho "Deploying to production..."\ngit pull origin main\nnpm install\npm run build\necho "Deployed successfully!"' },
      '/home/user/scripts/monitor.sh': { type: 'file', content: '#!/bin/bash\n# System monitor\nwhile true; do\n    echo "CPU: $(top -bn1 | grep Cpu | awk \'{print $2}%\')"\n    echo "Memory: $(free -m | awk \'NR==2{printf "%.1f%%", $3*100/$2}\')"\n    sleep 5\ndone' },
      '/home/user/.bashrc': { type: 'file', content: '# ~/.bashrc\nexport PATH=$PATH:/usr/local/bin\nalias ll="ls -la"\nalias la="ls -a"\nalias cls="clear"\nalias ..="cd .."\nalias ...="cd ../.."\n\n# Custom prompt\nPS1="\\u@\\h:\\w$ "' },
      '/home/user/.profile': { type: 'file', content: '# ~/.profile\n# executed by the command interpreter for login shells\n\nif [ -f "$HOME/.bashrc" ]; then\n    . "$HOME/.bashrc"\nfi\n\nexport PATH="$HOME/bin:$PATH"' },
      '/home/user/.vimrc': { type: 'file', content: '" Vim configuration\nset number\nset relativenumber\nset tabstop=4\nset shiftwidth=4\nset expandtab\nsyntax on\nset hlsearch\nset incsearch' },
      '/home/user/.gitconfig': { type: 'file', content: '[user]\n    name = GlassOS User\n    email = user@glassos.local\n[core]\n    editor = vim\n[alias]\n    co = checkout\n    br = branch\n    st = status' },
      '/etc': { type: 'dir', children: ['hostname', 'passwd', 'hosts', 'fstab', 'resolv.conf', 'os-release', 'shadow', 'group', 'sudoers'] },
      '/etc/hostname': { type: 'file', content: 'glassos' },
      '/etc/passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nuser:x:1000:1000:user:/home/user:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin' },
      '/etc/hosts': { type: 'file', content: '127.0.0.1\tlocalhost\n127.0.1.1\tglassos\n\n# The following lines are desirable for IPv6 capable hosts\n::1     localhost ip6-localhost ip6-loopback\nff02::1 ip6-allnodes\nff02::2 ip6-allrouters' },
      '/etc/fstab': { type: 'file', content: '# /etc/fstab: static file system information.\n# <file system> <mount point>   <type>  <options>       <dump>  <pass>\n/dev/sda1       /               ext4    errors=remount-ro 0       1\n/dev/sda2       /home           ext4    defaults        0       2\n/dev/sda3       none            swap    sw              0       0\ntmpfs           /tmp            tmpfs   defaults        0       0' },
      '/etc/resolv.conf': { type: 'file', content: '# Dynamic resolv.conf(5) file for glibc resolver\nnameserver 8.8.8.8\nnameserver 8.8.4.4\nsearch localdomain' },
      '/etc/os-release': { type: 'file', content: 'NAME="GlassOS"\nVERSION="1.0"\nID=glassos\nID_LIKE=debian\nPRETTY_NAME="GlassOS 1.0"\nVERSION_ID="1.0"\nHOME_URL="https://glassos.local"\nBUG_REPORT_URL="https://glassos.local/bugs"' },
      '/etc/shadow': { type: 'file', content: 'root:$6$rounds=656000$...:19000:0:99999:7:::\nuser:$6$rounds=656000$...:19000:0:99999:7:::' },
      '/etc/group': { type: 'file', content: 'root:x:0:\ndaemon:x:1:\nuser:x:1000:\nsudo:x:27:user\nadm:x:4:user\nstaff:x:50:' },
      '/etc/sudoers': { type: 'file', content: '# /etc/sudoers\nroot    ALL=(ALL:ALL) ALL\nuser    ALL=(ALL:ALL) ALL\n\n# Members of the sudo group may gain root privileges\n%sudo   ALL=(ALL:ALL) ALL' },
      '/var': { type: 'dir', children: ['log', 'cache', 'tmp', 'run'] },
      '/var/log': { type: 'dir', children: ['syslog', 'auth.log', 'kern.log', 'dpkg.log', 'apt'] },
      '/var/log/syslog': { type: 'file', content: 'Jun 28 10:00:00 glassos kernel: [    0.000000] Linux version 6.1.0-glassos\nJun 28 10:00:01 glassos systemd[1]: Started Journal Service\nJun 28 10:00:02 glassos kernel: [    0.123456] EXT4-fs (sda1): mounted filesystem\nJun 28 10:00:03 glassos sshd[1234]: Server listening on 0.0.0.0 port 22\nJun 28 10:05:00 glassos CRON[5678]: (user) CMD (cd /home/user && ./scripts/monitor.sh)' },
      '/var/log/auth.log': { type: 'file', content: 'Jun 28 10:00:01 glassos sshd[1234]: Accepted publickey for user from 192.168.1.100\nJun 28 10:00:05 glassos login[2345]: pam_unix(login:session): session opened for user\nJun 28 10:05:00 glassos sudo: user : TTY=pts/0 ; PWD=/home/user ; USER=root ; COMMAND=/bin/cat /etc/shadow' },
      '/var/log/kern.log': { type: 'file', content: 'Jun 28 10:00:00 glassos kernel: [    0.000000] Command line: BOOT_IMAGE=/vmlinuz-6.1.0\nJun 28 10:00:00 glassos kernel: [    0.000000] BIOS-provided physical RAM map:\nJun 28 10:00:00 glassos kernel: [    0.123456] EXT4-fs (sda1): mounted filesystem' },
      '/var/log/dpkg.log': { type: 'file', content: '2026-06-28 10:00:00 install vim:amd64 2:9.1.0000 <none>\n2026-06-28 10:00:01 status half-installed vim:amd64 2:9.1.0000\n2026-06-28 10:00:02 status unpacked vim:amd64 2:9.1.0000\n2026-06-28 10:00:03 status installed vim:amd64 2:9.1.0000' },
      '/var/log/apt': { type: 'dir', children: ['history.log', 'term.log'] },
      '/var/log/apt/history.log': { type: 'file', content: 'Start-Date: 2026-06-28 10:00:00\nCommandline: apt install vim git\nRequested-By: user (1000)\nInstall: vim:amd64 (2:9.1.0000), git:amd64 (1:2.42.0)\nEnd-Date: 2026-06-28 10:00:15' },
      '/var/log/apt/term.log': { type: 'file', content: 'Log started: 2026-06-28 10:00:00\nReading package lists...\nBuilding dependency tree...\nThe following NEW packages will be installed:\n  vim git\nUnpacking vim (2:9.1.0000) ...\nSetting up vim (2:9.1.0000) ...\nLog ended: 2026-06-28 10:00:15' },
      '/var/cache': { type: 'dir', children: [] },
      '/var/tmp': { type: 'dir', children: [] },
      '/var/run': { type: 'dir', children: [] },
      '/usr': { type: 'dir', children: ['bin', 'lib', 'share', 'local', 'include', 'src'] },
      '/usr/bin': { type: 'dir', children: ['bash', 'vim', 'git', 'python3', 'gcc', 'make', 'curl', 'wget', 'ssh', 'top', 'ps', 'ls', 'cat', 'grep', 'find', 'sed', 'awk', 'sort', 'uniq', 'wc', 'head', 'tail', 'touch', 'mkdir', 'rm', 'cp', 'mv', 'chmod', 'chown', 'tar', 'zip', 'unzip', 'df', 'du', 'free', 'uptime', 'date', 'cal', 'bc', 'expr', 'seq'] },
      '/usr/lib': { type: 'dir', children: [] },
      '/usr/share': { type: 'dir', children: ['man', 'doc'] },
      '/usr/local': { type: 'dir', children: ['bin', 'lib', 'share'] },
      '/usr/include': { type: 'dir', children: [] },
      '/usr/src': { type: 'dir', children: [] },
      '/tmp': { type: 'dir', children: [] },
      '/bin': { type: 'dir', children: ['bash', 'sh', 'ls', 'cat', 'echo', 'cp', 'mv', 'rm', 'mkdir', 'rmdir', 'chmod', 'chown', 'mount', 'umount', 'ln', 'tar', 'gzip', 'gunzip', 'kill', 'ps', 'su', 'mount', 'umount', 'sync', 'sleep', 'test', 'true', 'false', 'bash'] },
      '/sbin': { type: 'dir', children: ['fdisk', 'mkfs', 'ifconfig', 'reboot', 'shutdown', 'halt', 'init', 'systemd'] },
      '/opt': { type: 'dir', children: [] },
      '/proc': { type: 'dir', children: ['cpuinfo', 'meminfo', 'version', 'uptime', 'loadavg', 'mounts'] },
      '/proc/cpuinfo': { type: 'file', content: 'processor\t: 0\nvendor_id\t: GenuineIntel\ncpu family\t: 6\nmodel\t\t: 142\nmodel name\t: Intel(R) Core(TM) i7-8700 CPU @ 3.20GHz\nstepping\t: 10\nmicrocode\t: 0xca\ncpu MHz\t\t: 3200.000\ncache size\t: 12288 KB\nphysical id\t: 0\ncpu cores\t: 6\nbogomips\t: 6399.99' },
      '/proc/meminfo': { type: 'file', content: 'MemTotal:       16384000 kB\nMemFree:         8192000 kB\nMemAvailable:   10240000 kB\nBuffers:          512000 kB\nCached:          2048000 kB\nSwapTotal:       4096000 kB\nSwapFree:        4096000 kB' },
      '/proc/version': { type: 'file', content: 'Linux version 6.1.0-glassos (user@glassos) (gcc (Ubuntu 11.3.0) 11.3.0, GNU ld (GNU Binutils for Ubuntu) 2.38) #1 SMP PREEMPT_DYNAMIC' },
      '/proc/uptime': { type: 'file', content: '86400.00 172800.00' },
      '/proc/loadavg': { type: 'file', content: '0.15 0.25 0.30 1/256 1234' },
      '/proc/mounts': { type: 'file', content: '/dev/sda1 / ext4 rw,relatime,errors=remount-ro 0 0\ntmpfs /tmp tmpfs rw,nosuid,nodev 0 0\n/dev/sda2 /home ext4 rw,relatime 0 0' },
      '/dev': { type: 'dir', children: ['null', 'zero', 'random', 'urandom', 'tty', 'console'] },
      '/dev/null': { type: 'file', content: '' },
      '/dev/zero': { type: 'file', content: '\0'.repeat(1024) },
      '/dev/random': { type: 'file', content: '[random data]' },
      '/dev/urandom': { type: 'file', content: '[random data]' },
      '/dev/tty': { type: 'file', content: '' },
      '/dev/console': { type: 'file', content: '' },
      '/mnt': { type: 'dir', children: [] },
      '/media': { type: 'dir', children: [] },
      '/srv': { type: 'dir', children: [] },
      '/root': { type: 'dir', children: ['.bash_history'] },
      '/root/.bash_history': { type: 'file', content: 'apt update\napt install -y vim\ncd /home/user\nls -la\nnano /etc/hostname' }
    }
    this.cwd = '/home/user'
    this.env = {
      HOME: '/home/user',
      USER: 'user',
      SHELL: '/bin/bash',
      PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
      HOSTNAME: 'glassos',
      TERM: 'xterm-256color',
      LANG: 'en_US.UTF-8',
      LC_ALL: 'en_US.UTF-8',
      EDITOR: 'vim',
      PWD: '/home/user',
      OLDPWD: '/home/user',
      LOGNAME: 'user',
      MAIL: '/var/mail/user',
      HOSTTYPE: 'x86_64',
      MACHTYPE: 'x86_64-pc-linux-gnu',
      OSTYPE: 'linux-gnu'
    }
    this.history = []
    this.historyIndex = -1
    this.aliases = { 'll': 'ls -la', 'la': 'ls -a', 'cls': 'clear', '..': 'cd ..', '...': 'cd ../..' }
    this.allCommands = [
      'ls','cd','pwd','cat','echo','printf','mkdir','touch','rm','rmdir','cp','mv','ln',
      'head','tail','wc','grep','egrep','fgrep','find','locate','sort','uniq','cut','tr','sed','awk','diff','comm','tee','xargs',
      'date','cal','whoami','id','groups','hostname','uname','uptime','env','printenv','export','unset','set','history',
      'clear','reset','help','man','info','which','whereis','type','file','stat','tree','du','df','free',
      'ps','top','htop','kill','killall','pkill','nohup','jobs','fg','bg',
      'chmod','chown','chgrp','tar','gzip','gunzip','bzip2','zip','unzip',
      'curl','wget','ping','ifconfig','ip','netstat','ss','nslookup','dig','host','ssh','scp','rsync',
      'git','vim','vi','nano','python3','python','pip','pip3','gcc','g++','make','cmake',
      'apt','apt-get','dpkg','snap','systemctl','service',
      'mount','umount','fdisk','lsblk','swapon','sync','reboot','shutdown','halt','poweroff',
      'sleep','yes','seq','bc','expr','test','true','false','time',
      'alias','unalias','source','exec','eval','shift','read','exit','logout',
      'neofetch','screenfetch','lsof','lsmod','lsusb','lscpu','dmesg','journalctl',
      'crontab','at','batch','atq','atrm','last','lastlog','w','finger',
      'su','sudo','useradd','usermod','userdel','passwd','groupadd','groupdel','newgrp','gpasswd',
      'ssh-keygen','ssh-copy-id','ssh-agent','ssh-add','sshfs','sftp',
      'strace','ltrace','nc','ncat','socat','tcpdump','nmap','traceroute','mtr','route','arp',
      'iptables','ufw','firewall-cmd',
      'docker','podman','kubectl','helm','terraform','ansible','vagrant','packer',
      'node','npm','npx','yarn','pnpm','bun','deno',
      'php','ruby','perl','lua','go','rustc','cargo',
      'java','javac','gradle','mvn','dotnet',
      'tmux','screen','byobu','zsh','fish','csh','ksh','dash','ash',
      'watch','locate','updatedb','xclip','xsel','notify-send'
    ]
    this.pipes = []
    this.uptime = Date.now()
    this.jobs = []
    this.exitCode = 0
  }

  resolvePath(p) {
    if (!p) return this.cwd
    if (p === '-') return this.env.OLDPWD || this.cwd
    if (p === '~') return this.env.HOME
    if (p.startsWith('~/')) p = this.env.HOME + p.slice(1)
    if (!p.startsWith('/')) p = this.cwd + '/' + p
    const parts = p.split('/').filter(Boolean)
    const resolved = []
    for (const part of parts) {
      if (part === '.') continue
      if (part === '..') { resolved.pop(); continue }
      resolved.push(part)
    }
    return '/' + resolved.join('/') || '/'
  }

  getNode(path) {
    return this.fs[path] || null
  }

  getParent(path) {
    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/'
    return this.getNode(parentPath)
  }

  getFileName(path) {
    return path.split('/').pop()
  }

  exec(input) {
    const trimmed = input.trim()
    if (!trimmed) return ''

    this.history.push(trimmed)
    this.historyIndex = this.history.length

    let cmd = trimmed
    for (const [alias, expansion] of Object.entries(this.aliases)) {
      if (cmd.startsWith(alias + ' ') || cmd === alias) {
        cmd = cmd.replace(alias, expansion)
        break
      }
    }

    const realCmds = ['ssh', 'scp', 'sftp', 'ssh-keygen', 'ssh-copy-id', 'ssh-agent', 'ssh-add', 'rsync', 'ping', 'curl', 'wget', 'nmap', 'traceroute', 'mtr', 'nc', 'ncat', 'socat', 'tcpdump', 'nslookup', 'dig', 'host', 'arp']
    const firstWord = cmd.split(/\s/)[0]
    if (realCmds.includes(firstWord)) {
      return { __realExec: true, cmd }
    }

    if (cmd.includes('|')) {
      return this.execPipe(cmd)
    }

    if (cmd.includes('&&')) {
      const parts = cmd.split('&&')
      let output = ''
      for (const part of parts) {
        const result = this.execSingle(part.trim())
        if (result === '__EXIT__' || result === '__CLEAR__') return result
        output += result + '\n'
      }
      return output.trim()
    }

    if (cmd.includes(';')) {
      const parts = cmd.split(';')
      let output = ''
      for (const part of parts) {
        const result = this.execSingle(part.trim())
        if (result === '__EXIT__' || result === '__CLEAR__') return result
        if (result) output += result + '\n'
      }
      return output.trim()
    }

    return this.execSingle(cmd)
  }

  execPipe(cmd) {
    const commands = cmd.split('|').map(c => c.trim())
    let input = ''
    for (const command of commands) {
      const result = this.execSingle(command, input)
      if (result === '__EXIT__' || result === '__CLEAR__') return result
      input = result
    }
    return input
  }

  execSingle(input, pipeInput) {
    const trimmed = input.trim()
    if (!trimmed) return ''

    this._pipeInput = pipeInput || null

    let cmd = trimmed
    for (const [alias, expansion] of Object.entries(this.aliases)) {
      if (cmd.startsWith(alias + ' ') || cmd === alias) {
        cmd = cmd.replace(alias, expansion)
        break
      }
    }

    let redirect = null
    let appendRedirect = null
    let redirectFile = null
    const redirectMatch = cmd.match(/^(.*?)\s*(>>|>)\s*(\S+)\s*$/)
    if (redirectMatch) {
      cmd = redirectMatch[1].trim()
      appendRedirect = redirectMatch[2] === '>>'
      redirectFile = redirectMatch[3]
    }

    const parts = this.parseCommand(cmd)
    const command = parts[0]
    const args = parts.slice(1)

    if (pipeInput && ['cat', 'grep', 'sed', 'awk', 'sort', 'uniq', 'wc', 'head', 'tail', 'tr', 'cut'].includes(command)) {
      args.unshift(pipeInput)
    }

    const commands = {
      'pwd': () => this.cwd,
      'cd': () => this.cmdCd(args),
      'ls': () => this.cmdLs(args),
      'cat': () => this.cmdCat(args),
      'echo': () => this.cmdEcho(args, cmd),
      'printf': () => this.cmdPrintf(args),
      'mkdir': () => this.cmdMkdir(args),
      'touch': () => this.cmdTouch(args),
      'rm': () => this.cmdRm(args),
      'rmdir': () => this.cmdRmdir(args),
      'cp': () => this.cmdCp(args),
      'mv': () => this.cmdMv(args),
      'ln': () => this.cmdLn(args),
      'head': () => this.cmdHead(args),
      'tail': () => this.cmdTail(args),
      'wc': () => this.cmdWc(args),
      'grep': () => this.cmdGrep(args),
      'egrep': () => this.cmdGrep(args),
      'fgrep': () => this.cmdGrep(args),
      'find': () => this.cmdFind(args),
      'locate': () => this.cmdFind(args),
      'sort': () => this.cmdSort(args),
      'uniq': () => this.cmdUniq(args),
      'cut': () => this.cmdCut(args),
      'tr': () => this.cmdTr(args),
      'sed': () => this.cmdSed(args),
      'awk': () => this.cmdAwk(args),
      'diff': () => this.cmdDiff(args),
      'comm': () => this.cmdComm(args),
      'tee': () => this.cmdTee(args),
      'xargs': () => this.cmdXargs(args),
      'date': () => this.cmdDate(args),
      'cal': () => this.cmdCal(args),
      'whoami': () => 'user',
      'id': () => 'uid=1000(user) gid=1000(user) groups=1000(user),27(sudo),4(adm),50(staff)',
      'groups': () => 'user sudo adm staff',
      'hostname': () => 'glassos',
      'uname': () => this.cmdUname(args),
      'uptime': () => this.cmdUptime(),
      'env': () => this.cmdEnv(),
      'printenv': () => this.cmdEnv(),
      'export': () => this.cmdExport(args),
      'unset': () => this.cmdUnset(args),
      'set': () => this.cmdSet(args),
      'history': () => this.cmdHistory(),
      'clear': () => '__CLEAR__',
      'reset': () => '__CLEAR__',
      'help': () => this.cmdHelp(),
      'man': () => this.cmdMan(args),
      'info': () => this.cmdMan(args),
      'which': () => this.cmdWhich(args),
      'whereis': () => this.cmdWhereis(args),
      'type': () => this.cmdType(args),
      'file': () => this.cmdFile(args),
      'stat': () => this.cmdStat(args),
      'tree': () => this.cmdTree(args),
      'du': () => this.cmdDu(args),
      'df': () => this.cmdDf(args),
      'free': () => this.cmdFree(),
      'ps': () => this.cmdPs(args),
      'top': () => this.cmdTop(),
      'htop': () => this.cmdTop(),
      'kill': () => this.cmdKill(args),
      'killall': () => this.cmdKill(args),
      'pkill': () => this.cmdKill(args),
      'nohup': () => '# nohup: process detached',
      'jobs': () => this.cmdJobs(),
      'fg': () => 'fg: no current job',
      'bg': () => 'bg: no current job',
      'chmod': () => this.cmdChmod(args),
      'chown': () => this.cmdChown(args),
      'chgrp': () => this.cmdChgrp(args),
      'tar': () => this.cmdTar(args),
      'gzip': () => this.cmdGzip(args),
      'gunzip': () => this.cmdGunzip(args),
      'bzip2': () => '# bzip2: simulated',
      'zip': () => this.cmdZip(args),
      'unzip': () => this.cmdUnzip(args),
      'curl': () => this.cmdCurl(args),
      'wget': () => this.cmdWget(args),
      'ping': () => this.cmdPing(args),
      'ifconfig': () => this.cmdIfconfig(),
      'ip': () => this.cmdIp(args),
      'netstat': () => this.cmdNetstat(),
      'ss': () => this.cmdNetstat(),
      'nslookup': () => this.cmdNslookup(args),
      'dig': () => this.cmdNslookup(args),
      'host': () => this.cmdNslookup(args),
      'ssh': () => this.cmdSsh(args),
      'scp': () => '# scp: simulated',
      'rsync': () => '# rsync: simulated',
      'git': () => this.cmdGit(args),
      'vim': () => this.cmdVim(args),
      'vi': () => this.cmdVim(args),
      'nano': () => this.cmdVim(args),
      'python3': () => this.cmdPython(args),
      'python': () => this.cmdPython(args),
      'pip': () => '# pip package manager (simulated)\nUsage: pip install <package>',
      'pip3': () => '# pip3 package manager (simulated)\nUsage: pip3 install <package>',
      'gcc': () => this.cmdGcc(args),
      'g++': () => this.cmdGcc(args),
      'make': () => this.cmdMake(args),
      'cmake': () => '# cmake: simulated',
      'apt': () => this.cmdApt(args),
      'apt-get': () => this.cmdApt(args),
      'dpkg': () => this.cmdDpkg(args),
      'snap': () => '# snap package manager (simulated)',
      'systemctl': () => this.cmdSystemctl(args),
      'service': () => this.cmdService(args),
      'mount': () => this.cmdMount(args),
      'umount': () => this.cmdUmount(args),
      'fdisk': () => '# fdisk: simulated\nDevice     Boot   Start     End Sectors  Size Id Type\n/dev/sda1  *       2048 4196351 4194304    2G 83 Linux\n/dev/sda2       4196352 20971519 16775168   8G 83 Linux',
      'lsblk': () => 'NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT\nsda      8:0    0   10G  0 disk \n├─sda1   8:1    0    2G  0 part /\n├─sda2   8:2    0    8G  0 part /home',
      'swapon': () => '# swapon: simulated',
      'sync': () => '',
      'reboot': () => '# reboot: system reboot (simulated)',
      'shutdown': () => '# shutdown: system shutdown (simulated)',
      'halt': () => '# halt: system halt (simulated)',
      'poweroff': () => '# poweroff: system poweroff (simulated)',
      'sleep': () => '',
      'yes': () => 'y\ny\ny\ny\ny\ny\ny\ny\ny\ny',
      'seq': () => this.cmdSeq(args),
      'bc': () => this.cmdBc(args),
      'expr': () => this.cmdExpr(args),
      'test': () => this.cmdTest(args),
      '[': () => this.cmdTest(args),
      'true': () => '',
      'false': () => '',
      'time': () => 'real\t0m0.001s\nuser\t0m0.000s\nsys\t0m0.001s',
      'timeit': () => 'real\t0m0.001s\nuser\t0m0.000s\nsys\t0m0.001s',
      'alias': () => this.cmdAlias(args),
      'unalias': () => this.cmdUnalias(args),
      'source': () => '# source: simulated',
      '.': () => '# .: simulated',
      'exec': () => '',
      'eval': () => '',
      'shift': () => '',
      'read': () => '',
      'exit': () => '__EXIT__',
      'logout': () => '__EXIT__',
      'neofetch': () => this.cmdNeofetch(),
      'screenfetch': () => this.cmdNeofetch(),
      'watch': () => '# watch: simulated (would run command repeatedly)',
      'strace': () => '# strace: simulated',
      'ltrace': () => '# ltrace: simulated',
      'lsof': () => 'COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\nbash     1234   user  cwd    DIR    8,1     4096  1234 /home/user\nvim      5678   user  txt    REG    8,1   123456  5678 /usr/bin/vim',
      'lsmod': () => 'Module                  Size  Used by\nnvidia_drm             73728  0\nnvidia_modeset       1142784  1 nvidia_drm\nnvidia              31037440  2 nvidia_modeset\ndrm_kms_helper        294912  1 nvidia_drm',
      'lsusb': () => 'Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub\nBus 001 Device 002: ID 8087:0026 Intel Corp. \nBus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub',
      'lscpu': () => 'Architecture:        x86_64\nCPU op-mode(s):      32-bit, 64-bit\nByte Order:          Little Endian\nCPU(s):              6\nOn-line CPU(s) list: 0-5\nVendor ID:           GenuineIntel\nModel name:          Intel(R) Core(TM) i7-8700 CPU @ 3.20GHz',
      'dmesg': () => '[    0.000000] Linux version 6.1.0-glassos\n[    0.000000] Command line: BOOT_IMAGE=/vmlinuz\n[    0.123456] EXT4-fs (sda1): mounted filesystem\n[    0.234567] systemd[1]: Started Journal Service',
      'journalctl': () => 'Jun 28 10:00:00 glassos kernel: [    0.000000] Linux version 6.1.0\nJun 28 10:00:01 glassos systemd[1]: Started Journal Service',
      'crontab': () => '# crontab: no crontab for user',
      'at': () => '# at: simulated',
      'batch': () => '# batch: simulated',
      'atq': () => '',
      'atrm': () => '',
      'last': () => 'user     pts/0        192.168.1.100    Sun Jun 28 10:00   still logged in',
      'lastlog': () => 'Username         Port     From             Latest\nuser             pts/0    192.168.1.100    Sun Jun 28 10:00:00 +0800',
      'w': () => ' 10:00:00 up 1 day,  3:42,  1 user,  load average: 0.15, 0.25, 0.30\nUSER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\nuser     pts/0    192.168.1.100    10:00    0.00s  0.12s  0.01s w',
      'finger': () => 'Login: user         Name: GlassOS User\nDirectory: /home/user         Shell: /bin/bash\nOn since Sun Jun 28 10:00:00 on pts/0\nNo mail.\nNo Plan.',
      'write': () => '# write: simulated',
      'wall': () => '# wall: simulated',
      'mesg': () => '',
      'talk': () => '# talk: simulated',
      'nmap': () => '# nmap: network scanner (simulated)',
      'nc': () => '# nc: netcat (simulated)',
      'ncat': () => '# ncat: (simulated)',
      'socat': () => '# socat: (simulated)',
      'tcpdump': () => '# tcpdump: (simulated)',
      'wireshark': () => '# wireshark: (simulated)',
      'traceroute': () => '# traceroute: (simulated)',
      'mtr': () => '# mtr: (simulated)',
      'route': () => `Kernel IP routing table\nDestination     Gateway         Genmask         Flags Metric Ref    Use Iface\ndefault         192.168.1.1     0.0.0.0         UG    100    0        0 eth0\n192.168.1.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0`,
      'arp': () => 'Address                  HWtype  HWaddress           Flags Mask            Iface\n192.168.1.1              ether   00:11:22:33:44:55   C                     eth0\n192.168.1.100            ether   AA:BB:CC:DD:EE:FF   C                     eth0',
      'whois': () => '# whois: (simulated)',
      'iptables': () => '# iptables: (simulated)',
      'ufw': () => '# ufw: (simulated)',
      'firewall-cmd': () => '# firewall-cmd: (simulated)',
      'useradd': () => '# useradd: (simulated)',
      'usermod': () => '# usermod: (simulated)',
      'userdel': () => '# userdel: (simulated)',
      'passwd': () => '# passwd: (simulated)',
      'groupadd': () => '# groupadd: (simulated)',
      'groupdel': () => '# groupdel: (simulated)',
      'newgrp': () => '# newgrp: (simulated)',
      'su': () => '# su: (simulated)',
      'sudo': () => this.cmdSudo(args),
      'visudo': () => '# visudo: (simulated)',
      'adduser': () => '# adduser: (simulated)',
      'deluser': () => '# deluser: (simulated)',
      'addgroup': () => '# addgroup: (simulated)',
      'delgroup': () => '# delgroup: (simulated)',
      'gpasswd': () => '# gpasswd: (simulated)',
      'pkexec': () => '# pkexec: (simulated)',
      'policykit': () => '# policykit: (simulated)',
      'dbus-send': () => '# dbus-send: (simulated)',
      'gsettings': () => '# gsettings: (simulated)',
      'xdg-open': () => '# xdg-open: (simulated)',
      'xclip': () => '# xclip: (simulated)',
      'xsel': () => '# xsel: (simulated)',
      'notify-send': () => '# notify-send: (simulated)',
      'zenity': () => '# zenity: (simulated)',
      'dialog': () => '# dialog: (simulated)',
      'whiptail': () => '# whiptail: (simulated)',
      'fzf': () => '# fzf: (simulated)',
      'bat': () => this.cmdCat(args),
      'exa': () => this.cmdLs(args),
      'lsd': () => this.cmdLs(args),
      'delta': () => '# delta: diff viewer (simulated)',
      'rg': () => this.cmdGrep(args),
      'ag': () => this.cmdGrep(args),
      'pt': () => this.cmdGrep(args),
      'fd': () => this.cmdFind(args),
      'fzf': () => '# fzf: fuzzy finder (simulated)',
      'tmux': () => '# tmux: terminal multiplexer (simulated)',
      'screen': () => '# screen: terminal multiplexer (simulated)',
      'byobu': () => '# byobu: terminal multiplexer (simulated)',
      'zsh': () => '# zsh: z shell (simulated)',
      'fish': () => '# fish: friendly interactive shell (simulated)',
      'csh': () => '# csh: C shell (simulated)',
      'ksh': () => '# ksh: Korn shell (simulated)',
      'dash': () => '# dash: Debian Almquist shell (simulated)',
      'ash': () => '# ash: Alpine shell (simulated)',
      'busybox': () => '# busybox: (simulated)',
      'tput': () => '',
      'stty': () => '',
      'termux': () => '# termux: (simulated)',
      'adb': () => '# adb: Android Debug Bridge (simulated)',
      'fastboot': () => '# fastboot: (simulated)',
      'docker': () => '# Docker version 24.0.0, build (simulated)',
      'podman': () => '# podman: (simulated)',
      'kubectl': () => '# kubectl: (simulated)',
      'helm': () => '# helm: (simulated)',
      'ansible': () => '# ansible: (simulated)',
      'chef': () => '# chef: (simulated)',
      'puppet': () => '# puppet: (simulated)',
      'salt': () => '# salt: (simulated)',
      'consul': () => '# consul: (simulated)',
      'vault': () => '# vault: (simulated)',
      'nomad': () => '# nomad: (simulated)',
      'etcd': () => '# etcd: (simulated)',
      'redis-cli': () => '# redis-cli: (simulated)',
      'mysql': () => '# mysql: (simulated)',
      'psql': () => '# psql: (simulated)',
      'mongo': () => '# mongo: (simulated)',
      'sqlite3': () => '# sqlite3: (simulated)',
      'php': () => '# PHP 8.2.0 (simulated)',
      'ruby': () => '# ruby 3.1.2 (simulated)',
      'perl': () => '# perl v5.36.0 (simulated)',
      'lua': () => '# Lua 5.4.4 (simulated)',
      'node': () => '# Node.js v20.0.0 (simulated)',
      'npm': () => '# npm 9.6.0 (simulated)',
      'npx': () => '# npx (simulated)',
      'yarn': () => '# yarn 1.22.0 (simulated)',
      'pnpm': () => '# pnpm (simulated)',
      'deno': () => '# deno 1.32.0 (simulated)',
      'bun': () => '# bun 0.6.0 (simulated)',
      'java': () => '# openjdk 17.0.2 (simulated)',
      'javac': () => '# javac 17.0.2 (simulated)',
      'gradle': () => '# Gradle 8.0 (simulated)',
      'mvn': () => '# Apache Maven 3.8.6 (simulated)',
      'dotnet': () => '# .NET 7.0 (simulated)',
      'go': () => '# go version go1.20.0 (simulated)',
      'rustc': () => '# rustc 1.68.0 (simulated)',
      'cargo': () => '# cargo 1.68.0 (simulated)',
      'swift': () => '# Swift 5.7.2 (simulated)',
      'kotlin': () => '# Kotlin 1.8.0 (simulated)',
      'scala': () => '# Scala 3.2.0 (simulated)',
      'haskell': () => '# GHC 9.4.0 (simulated)',
      'erlang': () => '# Erlang/OTP 25 (simulated)',
      'elixir': () => '# Elixir 1.14.0 (simulated)',
      'clojure': () => '# Clojure 1.11.0 (simulated)',
      'lisp': () => '# SBCL 2.3.0 (simulated)',
      'r': () => '# R version 4.2.0 (simulated)',
      'julia': () => '# Julia 1.8.0 (simulated)',
      'matlab': () => '# MATLAB (simulated)',
      'stata': () => '# Stata (simulated)',
      'spss': () => '# SPSS (simulated)',
      'sas': () => '# SAS (simulated)',
      'r-project': () => '# R Project (simulated)',
      'rstudio': () => '# RStudio (simulated)',
      'jupyter': () => '# Jupyter Notebook (simulated)',
      'ipython': () => '# IPython 8.0.0 (simulated)',
      'jupyterhub': () => '# JupyterHub (simulated)',
      'jupyterlab': () => '# JupyterLab (simulated)',
      'notebook': () => '# Jupyter Notebook (simulated)',
      'voila': () => '# Voila (simulated)',
      'streamlit': () => '# Streamlit (simulated)',
      'gradio': () => '# Gradio (simulated)',
      'flask': () => '# Flask (simulated)',
      'django': () => '# Django (simulated)',
      'fastapi': () => '# FastAPI (simulated)',
      'uvicorn': () => '# Uvicorn (simulated)',
      'gunicorn': () => '# Gunicorn (simulated)',
      'celery': () => '# Celery (simulated)',
      'redis': () => '# Redis (simulated)',
      'rabbitmq': () => '# RabbitMQ (simulated)',
      'kafka': () => '# Kafka (simulated)',
      'zookeeper': () => '# ZooKeeper (simulated)',
      'elasticsearch': () => '# Elasticsearch (simulated)',
      'logstash': () => '# Logstash (simulated)',
      'kibana': () => '# Kibana (simulated)',
      'prometheus': () => '# Prometheus (simulated)',
      'grafana': () => '# Grafana (simulated)',
      'nagios': () => '# Nagios (simulated)',
      'zabbix': () => '# Zabbix (simulated)',
      'cacti': () => '# Cacti (simulated)',
      'mrtg': () => '# MRTG (simulated)',
      'ntopng': () => '# ntopng (simulated)',
      'iftop': () => '# iftop (simulated)',
      'nethogs': () => '# nethogs (simulated)',
      'vnstat': () => '# vnStat (simulated)',
      'bmon': () => '# bmon (simulated)',
      'nload': () => '# nload (simulated)',
      'slurm': () => '# Slurm (simulated)',
      'sacctmgr': () => '# sacctmgr (simulated)',
      'squeue': () => '# squeue (simulated)',
      'srun': () => '# srun (simulated)',
      'sbatch': () => '# sbatch (simulated)',
      'scancel': () => '# scancel (simulated)',
      'sinfo': () => '# sinfo (simulated)',
      'scontrol': () => '# scontrol (simulated)',
      'sprio': () => '# sprio (simulated)',
      'ssh-keygen': () => '# ssh-keygen: (simulated)',
      'ssh-copy-id': () => '# ssh-copy-id: (simulated)',
      'ssh-agent': () => '# ssh-agent: (simulated)',
      'ssh-add': () => '# ssh-add: (simulated)',
      'sshfs': () => '# sshfs: (simulated)',
      'sftp': () => '# sftp: (simulated)',
      'lftp': () => '# lftp: (simulated)',
      'aria2c': () => '# aria2c: (simulated)',
      'axel': () => '# axel: (simulated)',
      'wget2': () => '# wget2: (simulated)',
      'httpie': () => '# httpie: (simulated)',
      'xh': () => '# xh: (simulated)',
      'httpx': () => '# httpx: (simulated)',
      'curlie': () => '# curlie: (simulated)',
      'httpstat': () => '# httpstat: (simulated)',
      'hey': () => '# hey: (simulated)',
      'wrk': () => '# wrk: (simulated)',
      'ab': () => '# ab: (simulated)',
      'siege': () => '# siege: (simulated)',
      'vegeta': () => '# vegeta: (simulated)',
      'bombardier': () => '# bombardier: (simulated)',
      'k6': () => '# k6: (simulated)',
      'artillery': () => '# artillery: (simulated)',
      'jmeter': () => '# JMeter (simulated)',
      'locust': () => '# Locust (simulated)',
      'pytest': () => '# pytest (simulated)',
      'unittest': () => '# unittest (simulated)',
      'tox': () => '# tox (simulated)',
      'coverage': () => '# coverage (simulated)',
      'codecov': () => '# codecov (simulated)',
      'mypy': () => '# mypy (simulated)',
      'pylint': () => '# pylint (simulated)',
      'flake8': () => '# flake8 (simulated)',
      'black': () => '# black (simulated)',
      'isort': () => '# isort (simulated)',
      'autopep8': () => '# autopep8 (simulated)',
      'yapf': () => '# yapf (simulated)',
      'pre-commit': () => '# pre-commit (simulated)',
      'husky': () => '# husky (simulated)',
      'lint-staged': () => '# lint-staged (simulated)',
      'commitlint': () => '# commitlint (simulated)',
      'semantic-release': () => '# semantic-release (simulated)',
      'standard-version': () => '# standard-version (simulated)',
      'lerna': () => '# lerna (simulated)',
      'changesets': () => '# changesets (simulated)',
      'release-it': () => '# release-it (simulated)',
      'np': () => '# np (simulated)',
      'verdaccio': () => '# verdaccio (simulated)',
      'netlify': () => '# netlify (simulated)',
      'vercel': () => '# vercel (simulated)',
      'heroku': () => '# heroku (simulated)',
      'firebase': () => '# firebase (simulated)',
      'supabase': () => '# supabase (simulated)',
      'planetscale': () => '# planetscale (simulated)',
      'neon': () => '# neon (simulated)',
      'turso': () => '# turso (simulated)',
      'flyctl': () => '# flyctl (simulated)',
      'render': () => '# render (simulated)',
      'railway': () => '# railway (simulated)',
      'docker-compose': () => '# docker-compose (simulated)',
      'podman-compose': () => '# podman-compose (simulated)',
      'k3d': () => '# k3d (simulated)',
      'minikube': () => '# minikube (simulated)',
      'kind': () => '# kind (simulated)',
      'k3s': () => '# k3s (simulated)',
      'rke2': () => '# rke2 (simulated)',
      'k0s': () => '# k0s (simulated)',
      'microk8s': () => '# microk8s (simulated)',
      'rancher': () => '# rancher (simulated)',
      'portainer': () => '# portainer (simulated)',
      'traefik': () => '# traefik (simulated)',
      'nginx': () => '# nginx (simulated)',
      'caddy': () => '# caddy (simulated)',
      'haproxy': () => '# haproxy (simulated)',
      'envoy': () => '# envoy (simulated)',
      'istio': () => '# istio (simulated)',
      'linkerd': () => '# linkerd (simulated)',
      'consul-connect': () => '# consul-connect (simulated)',
      'boundary': () => '# boundary (simulated)',
      'waypoint': () => '# waypoint (simulated)',
      'terragrunt': () => '# terragrunt (simulated)',
      'pulumi': () => '# pulumi (simulated)',
      'crossplane': () => '# crossplane (simulated)',
      'argocd': () => '# argocd (simulated)',
      'fluxcd': () => '# fluxcd (simulated)',
      'tekton': () => '# tekton (simulated)',
      'drone': () => '# drone (simulated)',
      'github-actions': () => '# github-actions (simulated)',
      'gitlab-ci': () => '# gitlab-ci (simulated)',
      'jenkins': () => '# jenkins (simulated)',
      'circleci': () => '# circleci (simulated)',
      'travis': () => '# travis (simulated)',
      'bitbucket-pipelines': () => '# bitbucket-pipelines (simulated)',
      'azure-devops': () => '# azure-devops (simulated)',
      'aws-codepipeline': () => '# aws-codepipeline (simulated)',
      'gcloud': () => '# gcloud (simulated)',
      'aws-cli': () => '# aws-cli (simulated)',
      'az': () => '# az (simulated)',
      'aliyun': () => '# aliyun (simulated)',
      'tencent-cloud': () => '# tencent-cloud (simulated)',
      'hcloud': () => '# hcloud (simulated)',
      'doctl': () => '# doctl (simulated)',
      'vultr-cli': () => '# vultr-cli (simulated)',
      'linode-cli': () => '# linode-cli (simulated)',
      'hetzner': () => '# hetzner (simulated)',
      'oci': () => '# oci (simulated)',
      'alibaba-cloud': () => '# alibaba-cloud (simulated)',
      'baidu-cloud': () => '# baidu-cloud (simulated)',
      'huawei-cloud': () => '# huawei-cloud (simulated)',
      'ucloud': () => '# ucloud (simulated)',
      'ksyun': () => '# ksyun (simulated)',
      'jd-cloud': () => '# jd-cloud (simulated)',
      'volcengine': () => '# volcengine (simulated)',
      'qcloud': () => '# qcloud (simulated)',
      'gcp': () => '# gcp (simulated)',
      'azure': () => '# azure (simulated)',
      'aws': () => '# aws (simulated)',
    }

    if (commands[command]) {
      let result = commands[command]()
      if (redirectFile && result !== '__CLEAR__' && result !== '__EXIT__') {
        const resolved = this.resolvePath(redirectFile)
        const parent = this.getParent(resolved)
        if (parent && parent.type === 'dir') {
          const name = this.getFileName(resolved)
          this.fs[resolved] = { type: 'file', content: result }
          if (!parent.children.includes(name)) parent.children.push(name)
        }
        return ''
      }
      return result
    }

    return `bash: ${command}: command not found\n提示: 输入 help 查看可用命令`
  }

  parseCommand(cmd) {
    const parts = []
    let current = ''
    let inSingle = false
    let inDouble = false
    let escaped = false

    for (let i = 0; i < cmd.length; i++) {
      const ch = cmd[i]
      if (escaped) { current += ch; escaped = false; continue }
      if (ch === '\\') { escaped = true; continue }
      if (ch === "'" && !inDouble) { inSingle = !inSingle; continue }
      if (ch === '"' && !inSingle) { inDouble = !inDouble; continue }
      if (ch === ' ' && !inSingle && !inDouble) {
        if (current) { parts.push(current); current = '' }
        continue
      }
      current += ch
    }
    if (current) parts.push(current)
    return parts
  }

  cmdPwd() { return this.cwd }

  cmdCd(args) {
    const target = args[0] || '~'
    const resolved = this.resolvePath(target)
    const node = this.getNode(resolved)
    if (!node) return `bash: cd: ${target}: No such file or directory`
    if (node.type !== 'dir') return `bash: cd: ${target}: Not a directory`
    this.env.OLDPWD = this.cwd
    this.cwd = resolved
    this.env.PWD = resolved
    return ''
  }

  cmdLs(args) {
    const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al') || args.includes('-A')
    const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al')
    const showHuman = args.includes('-h') || args.includes('-lh') || args.includes('-lah')
    const showColor = args.includes('--color')
    const recursive = args.includes('-R')
    const target = args.find(a => !a.startsWith('-')) || '.'
    const resolved = this.resolvePath(target)
    const node = this.getNode(resolved)

    if (!node) return `ls: cannot access '${target}': No such file or directory`
    if (node.type !== 'dir') return target

    let items = [...node.children]
    if (showAll) items = ['.', '..', ...items]

    if (showLong) {
      const lines = [`total ${items.length * 4}`]
      for (const item of items) {
        if (item === '.' || item === '..') {
          lines.push(`drwxr-xr-x  2 user user  4096 Jun 28 10:00 ${item}`)
          continue
        }
        const itemPath = resolved === '/' ? '/' + item : resolved + '/' + item
        const itemNode = this.getNode(itemPath)
        const size = itemNode && itemNode.type === 'file' ? (itemNode.content || '').length : 4096
        const sizeStr = showHuman ? this.formatSize(size) : String(size).padStart(6)
        if (itemNode && itemNode.type === 'dir') {
          lines.push(`drwxr-xr-x  2 user user  ${sizeStr} Jun 28 10:00 \x1b[1;34m${item}\x1b[0m`)
        } else if (item.endsWith('.sh') || item.endsWith('.py') || item.endsWith('.pl')) {
          lines.push(`-rwxr-xr-x  1 user user  ${sizeStr} Jun 28 10:00 \x1b[1;32m${item}\x1b[0m`)
        } else if (item.startsWith('.')) {
          lines.push(`-rw-r--r--  1 user user  ${sizeStr} Jun 28 10:00 \x1b[90m${item}\x1b[0m`)
        } else {
          lines.push(`-rw-r--r--  1 user user  ${sizeStr} Jun 28 10:00 ${item}`)
        }
      }
      return lines.join('\n')
    }

    return items.map(item => {
      if (item === '.' || item === '..') return `\x1b[1;34m${item}\x1b[0m`
      const itemPath = resolved === '/' ? '/' + item : resolved + '/' + item
      const itemNode = this.getNode(itemPath)
      if (itemNode && itemNode.type === 'dir') return `\x1b[1;34m${item}\x1b[0m`
      if (item.endsWith('.sh') || item.endsWith('.py') || item.endsWith('.pl')) return `\x1b[1;32m${item}\x1b[0m`
      if (item.endsWith('.tar.gz') || item.endsWith('.zip') || item.endsWith('.gz')) return `\x1b[1;31m${item}\x1b[0m`
      if (item.startsWith('.')) return `\x1b[90m${item}\x1b[0m`
      return item
    }).join('  ')
  }

  formatSize(bytes) {
    if (bytes < 1024) return bytes + 'B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'K'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'M'
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + 'G'
  }

  cmdCat(args) {
    if (!args.length) {
      if (this._pipeInput) return this._pipeInput
      return 'cat: missing file operand'
    }
    const outputs = []
    for (const arg of args) {
      if (arg === '-') continue
      const resolved = this.resolvePath(arg)
      const node = this.getNode(resolved)
      if (!node) { outputs.push(`cat: ${arg}: No such file or directory`); continue }
      if (node.type === 'dir') { outputs.push(`cat: ${arg}: Is a directory`); continue }
      outputs.push(node.content || '')
    }
    return outputs.join('\n')
  }

  cmdEcho(args, fullCmd) {
    let echoArgs = fullCmd.replace(/^echo\s*/, '')
    if (args.includes('-n')) {
      echoArgs = echoArgs.replace(/^-n\s*/, '')
    }
    let result = echoArgs
    for (const [key, val] of Object.entries(this.env)) {
      result = result.replace(new RegExp(`\\$${key}`, 'g'), val).replace(new RegExp(`\\$\\{${key}\\}`, 'g'), val)
    }
    result = result.replace(/\$(\w+)/g, (_, name) => this.env[name] || '')
    return result
  }

  cmdPrintf(args) {
    if (!args.length) return ''
    const format = args[0]
    let result = format
    for (let i = 1; i < args.length; i++) {
      result = result.replace(/%s/, args[i])
    }
    return result
  }

  cmdMkdir(args) {
    const makeParents = args.includes('-p')
    const dirs = args.filter(a => !a.startsWith('-'))
    if (!dirs.length) return 'mkdir: missing operand'
    const outputs = []
    for (const dir of dirs) {
      const resolved = this.resolvePath(dir)
      if (this.getNode(resolved)) { outputs.push(`mkdir: cannot create directory '${dir}': File exists`); continue }
      const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/'
      const parentNode = this.getNode(parentPath)
      if (!parentNode || parentNode.type !== 'dir') {
        if (makeParents) {
          const parts = resolved.split('/').filter(Boolean)
          let current = ''
          for (const part of parts) {
            current += '/' + part
            if (!this.getNode(current)) {
              this.fs[current] = { type: 'dir', children: [] }
              const parent = current.substring(0, current.lastIndexOf('/')) || '/'
              if (this.getNode(parent)) this.getNode(parent).children.push(part)
            }
          }
        } else {
          outputs.push(`mkdir: cannot create directory '${dir}': No such file or directory`)
          continue
        }
      } else {
        const dirName = resolved.split('/').pop()
        this.fs[resolved] = { type: 'dir', children: [] }
        parentNode.children.push(dirName)
      }
    }
    return outputs.join('\n')
  }

  cmdTouch(args) {
    if (!args.length) return 'touch: missing file operand'
    for (const arg of args) {
      const resolved = this.resolvePath(arg)
      if (this.getNode(resolved)) continue
      const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/'
      const parentNode = this.getNode(parentPath)
      if (!parentNode || parentNode.type !== 'dir') {
        return `touch: cannot touch '${arg}': No such file or directory`
      }
      this.fs[resolved] = { type: 'file', content: '' }
      parentNode.children.push(resolved.split('/').pop())
    }
    return ''
  }

  cmdRm(args) {
    const recursive = args.includes('-r') || args.includes('-rf') || args.includes('-fr') || args.includes('-R')
    const force = args.includes('-f') || args.includes('-rf') || args.includes('-fr')
    const interactive = args.includes('-i')
    const targets = args.filter(a => !a.startsWith('-'))
    if (!targets.length) return 'rm: missing operand'
    const outputs = []
    for (const target of targets) {
      const resolved = this.resolvePath(target)
      const node = this.getNode(resolved)
      if (!node) { if (!force) outputs.push(`rm: cannot remove '${target}': No such file or directory`); continue }
      if (node.type === 'dir' && !recursive) { outputs.push(`rm: cannot remove '${target}': Is a directory`); continue }
      const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/'
      const parentNode = this.getNode(parentPath)
      if (parentNode) {
        const name = resolved.split('/').pop()
        parentNode.children = parentNode.children.filter(c => c !== name)
      }
      if (node.type === 'dir') this.removeDirRecursive(resolved)
      else delete this.fs[resolved]
    }
    return outputs.join('\n')
  }

  cmdRmdir(args) {
    if (!args.length) return 'rmdir: missing operand'
    const outputs = []
    for (const arg of args) {
      const resolved = this.resolvePath(arg)
      const node = this.getNode(resolved)
      if (!node) { outputs.push(`rmdir: failed to remove '${arg}': No such file or directory`); continue }
      if (node.type !== 'dir') { outputs.push(`rmdir: failed to remove '${arg}': Not a directory`); continue }
      if (node.children.length > 0) { outputs.push(`rmdir: failed to remove '${arg}': Directory not empty`); continue }
      const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/'
      const parentNode = this.getNode(parentPath)
      if (parentNode) {
        parentNode.children = parentNode.children.filter(c => c !== resolved.split('/').pop())
      }
      delete this.fs[resolved]
    }
    return outputs.join('\n')
  }

  removeDirRecursive(path) {
    const node = this.fs[path]
    if (!node || node.type !== 'dir') { delete this.fs[path]; return }
    for (const child of node.children) {
      const childPath = path === '/' ? '/' + child : path + '/' + child
      this.removeDirRecursive(childPath)
    }
    delete this.fs[path]
  }

  cmdCp(args) {
    const recursive = args.includes('-r') || args.includes('-a') || args.includes('-R')
    const verbose = args.includes('-v')
    const force = args.includes('-f')
    const files = args.filter(a => !a.startsWith('-'))
    if (files.length < 2) return 'cp: missing destination operand'
    const src = this.resolvePath(files[0])
    const dst = this.resolvePath(files[1])
    const srcNode = this.getNode(src)
    if (!srcNode) return `cp: cannot stat '${files[0]}': No such file or directory`
    if (srcNode.type === 'dir' && !recursive) return `cp: -r not specified; omitting directory '${files[0]}'`
    if (srcNode.type === 'file') {
      const dstDir = dst.endsWith('/') ? dst : dst.substring(0, dst.lastIndexOf('/')) || '/'
      const dstParent = this.getNode(dst.endsWith('/') ? dst : dstDir)
      if (!dstParent || dstParent.type !== 'dir') return `cp: cannot create regular file '${files[1]}': No such file or directory`
      const dstName = dst.endsWith('/') ? src.split('/').pop() : dst.split('/').pop()
      const finalDst = (dst.endsWith('/') ? dst : dstDir) + '/' + dstName
      this.fs[finalDst] = { type: 'file', content: srcNode.content }
      if (!dstParent.children.includes(dstName)) dstParent.children.push(dstName)
    }
    return verbose ? `'${files[0]}' -> '${files[1]}'` : ''
  }

  cmdMv(args) {
    const verbose = args.includes('-v')
    const force = args.includes('-f')
    const files = args.filter(a => !a.startsWith('-'))
    if (files.length < 2) return 'mv: missing destination operand'
    const cpResult = this.cmdCp(['-r', ...files])
    if (cpResult && cpResult.startsWith('mv:')) return cpResult
    const src = this.resolvePath(files[0])
    const srcNode = this.getNode(src)
    if (srcNode) {
      const parentPath = src.substring(0, src.lastIndexOf('/')) || '/'
      const parentNode = this.getNode(parentPath)
      if (parentNode) {
        const name = src.split('/').pop()
        parentNode.children = parentNode.children.filter(c => c !== name)
      }
      delete this.fs[src]
    }
    return verbose ? `'${files[0]}' -> '${files[1]}'` : ''
  }

  cmdLn(args) {
    const symbolic = args.includes('-s')
    const force = args.includes('-f')
    const files = args.filter(a => !a.startsWith('-'))
    if (files.length < 2) return 'ln: missing target'
    const src = this.resolvePath(files[0])
    const dst = this.resolvePath(files[1])
    const srcNode = this.getNode(src)
    if (!srcNode) return `ln: failed to create symbolic link '${files[1]}': No such file or directory`
    const dstDir = this.getNode(dst.endsWith('/') ? dst : dst.substring(0, dst.lastIndexOf('/')) || '/')
    if (!dstDir || dstDir.type !== 'dir') return `ln: failed to create symbolic link '${files[1]}': No such file or directory`
    const dstName = dst.endsWith('/') ? src.split('/').pop() : dst.split('/').pop()
    this.fs[dst] = { type: symbolic ? 'symlink' : srcNode.type, content: srcNode.content, linkTarget: src }
    if (!dstDir.children.includes(dstName)) dstDir.children.push(dstName)
    return ''
  }

  cmdHead(args) {
    let n = 10
    let files = []
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) { n = parseInt(args[i + 1]); i++ }
      else if (args[i] === '-c' && args[i + 1]) { /* bytes mode */ }
      else files.push(args[i])
    }
    if (!files.length) return 'head: missing file operand'
    const outputs = []
    for (const f of files) {
      const resolved = this.resolvePath(f)
      const node = this.getNode(resolved)
      if (!node || node.type === 'dir') { outputs.push(`head: cannot open '${f}' for reading`); continue }
      const lines = (node.content || '').split('\n').slice(0, n)
      outputs.push(lines.join('\n'))
    }
    return outputs.join('\n')
  }

  cmdTail(args) {
    let n = 10
    let files = []
    let follow = false
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) { n = parseInt(args[i + 1]); i++ }
      else if (args[i] === '-f' || args[i] === '--follow') { follow = true }
      else files.push(args[i])
    }
    if (!files.length) return 'tail: missing file operand'
    const outputs = []
    for (const f of files) {
      const resolved = this.resolvePath(f)
      const node = this.getNode(resolved)
      if (!node || node.type === 'dir') { outputs.push(`tail: cannot open '${f}' for reading`); continue }
      const lines = (node.content || '').split('\n')
      outputs.push(lines.slice(-n).join('\n'))
    }
    return outputs.join('\n')
  }

  cmdWc(args) {
    const files = args.filter(a => !a.startsWith('-'))
    const showLines = args.includes('-l')
    const showWords = args.includes('-w')
    const showBytes = args.includes('-c') || args.includes('-m')
    const showAll = !showLines && !showWords && !showBytes
    if (!files.length) return 'wc: missing file operand'
    const results = []
    let totalLines = 0, totalWords = 0, totalBytes = 0
    for (const f of files) {
      const resolved = this.resolvePath(f)
      const node = this.getNode(resolved)
      if (!node || node.type === 'dir') { results.push(`wc: ${f}: No such file`); continue }
      const content = node.content || ''
      const lines = content.split('\n').length
      const words = content.split(/\s+/).filter(Boolean).length
      const bytes = content.length
      totalLines += lines
      totalWords += words
      totalBytes += bytes
      let output = ''
      if (showAll || showLines) output += `  ${lines}`
      if (showAll || showWords) output += `  ${words}`
      if (showAll || showBytes) output += `  ${bytes}`
      output += ` ${f}`
      results.push(output)
    }
    if (files.length > 1) {
      let total = ''
      if (showAll || showLines) total += `  ${totalLines}`
      if (showAll || showWords) total += `  ${totalWords}`
      if (showAll || showBytes) total += `  ${totalBytes}`
      total += ' total'
      results.push(total)
    }
    return results.join('\n')
  }

  cmdGrep(args) {
    const flags = args.filter(a => a.startsWith('-'))
    const nonFlags = args.filter(a => !a.startsWith('-'))
    let pattern = null
    let files = []
    for (let i = 0; i < nonFlags.length; i++) {
      if (!pattern) { pattern = nonFlags[i]; continue }
      files.push(nonFlags[i])
    }
    if (!pattern) return 'grep: missing arguments'
    const ignoreCase = flags.includes('-i')
    const countOnly = flags.includes('-c')
    const invertMatch = flags.includes('-v')
    const showLineNumbers = flags.includes('-n')
    const wholeLine = flags.includes('-w')
    const maxCount = flags.includes('-m') ? parseInt(flags[flags.indexOf('-m') + 1]) : Infinity
    if (!files.length && this._pipeInput) {
      files = ['_pipe']
    }
    if (!files.length) return 'grep: missing file operand'
    const results = []
    let matchCount = 0
    for (const f of files) {
      let content = ''
      if (f === '_pipe') {
        content = this._pipeInput || ''
      } else {
        const resolved = this.resolvePath(f)
        const node = this.getNode(resolved)
        if (!node || node.type === 'dir') { results.push(`grep: ${f}: No such file or directory`); continue }
        content = node.content || ''
      }
      const lines = content.split('\n')
      let fileMatchCount = 0
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        let matched = false
        if (wholeLine) {
          const regex = new RegExp(`\\b${pattern}\\b`, ignoreCase ? 'i' : '')
          matched = regex.test(line)
        } else {
          matched = ignoreCase ? line.toLowerCase().includes(pattern.toLowerCase()) : line.includes(pattern)
        }
        if (invertMatch) matched = !matched
        if (matched) {
          fileMatchCount++
          matchCount++
          let prefix = ''
          if (files.length > 1) prefix += f + ':'
          if (showLineNumbers) prefix += (i + 1) + ':'
          results.push(prefix + line)
          if (matchCount >= maxCount) break
        }
      }
      if (countOnly) results.push(`${fileMatchCount}`)
    }
    this.exitCode = matchCount > 0 ? 0 : 1
    return results.join('\n')
  }

  cmdFind(args) {
    let searchPath = '.'
    let namePattern = null
    let typeFilter = null
    let maxDepth = Infinity
    let minSize = null
    let maxSize = null
    let newerThan = null
    let execCmd = null
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-name' && args[i + 1]) { namePattern = args[i + 1].replace(/\*/g, '.*').replace(/\?/g, '.'); i++ }
      else if (args[i] === '-type' && args[i + 1]) { typeFilter = args[i + 1]; i++ }
      else if (args[i] === '-maxdepth' && args[i + 1]) { maxDepth = parseInt(args[i + 1]); i++ }
      else if (args[i] === '-mindepth' && args[i + 1]) { i++ }
      else if (args[i] === '-size' && args[i + 1]) {
        const sizeStr = args[i + 1]
        if (sizeStr.endsWith('k')) minSize = parseInt(sizeStr) * 1024
        else if (sizeStr.endsWith('M')) minSize = parseInt(sizeStr) * 1024 * 1024
        else minSize = parseInt(sizeStr)
        i++
      }
      else if (args[i] === '-exec' && args[i + 1]) { execCmd = args.slice(i + 1).join(' '); break }
      else if (!args[i].startsWith('-')) searchPath = args[i]
    }
    const resolved = this.resolvePath(searchPath)
    const results = []
    const search = (path, depth) => {
      if (depth > maxDepth) return
      const node = this.getNode(path)
      if (!node) return
      const name = path.split('/').pop()
      let matched = true
      if (namePattern && !new RegExp('^' + namePattern + '$').test(name)) matched = false
      if (typeFilter === 'f' && node.type !== 'file') matched = false
      if (typeFilter === 'd' && node.type !== 'dir') matched = false
      if (matched) {
        results.push(path === resolved ? '.' : path)
      }
      if (node.type === 'dir') {
        for (const child of node.children) {
          search(path === '/' ? '/' + child : path + '/' + child, depth + 1)
        }
      }
    }
    search(resolved, 0)
    return results.join('\n')
  }

  cmdSort(args) {
    const files = args.filter(a => !a.startsWith('-'))
    const reverse = args.includes('-r')
    const numeric = args.includes('-n')
    const unique = args.includes('-u')
    const caseInsensitive = args.includes('-f')
    let content = ''
    if (files.length) {
      const resolved = this.resolvePath(files[0])
      const node = this.getNode(resolved)
      if (node && node.type === 'file') content = node.content || ''
    } else if (this._pipeInput) {
      content = this._pipeInput
    } else {
      return 'sort: missing file operand'
    }
    let lines = content.split('\n')
    if (caseInsensitive) lines.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    else if (numeric) lines.sort((a, b) => parseFloat(a) - parseFloat(b))
    else lines.sort()
    if (reverse) lines.reverse()
    if (unique) lines = [...new Set(lines)]
    return lines.join('\n')
  }

  cmdUniq(args) {
    const files = args.filter(a => !a.startsWith('-'))
    const count = args.includes('-c')
    const duplicated = args.includes('-d')
    let content = ''
    if (files.length) {
      const resolved = this.resolvePath(files[0])
      const node = this.getNode(resolved)
      if (node && node.type === 'file') content = node.content || ''
    } else if (this._pipeInput) {
      content = this._pipeInput
    } else {
      return 'uniq: missing file operand'
    }
    const lines = content.split('\n')
    const results = []
    let prev = null
    let countNum = 0
    for (const line of lines) {
      if (line === prev) {
        countNum++
      } else {
        if (prev !== null) {
          if (duplicated && countNum > 1) results.push(prev)
          else if (!duplicated) results.push(count ? `      ${countNum} ${prev}` : prev)
        }
        prev = line
        countNum = 1
      }
    }
    if (prev !== null) {
      if (duplicated && countNum > 1) results.push(prev)
      else if (!duplicated) results.push(count ? `      ${countNum} ${prev}` : prev)
    }
    return results.join('\n')
  }

  cmdCut(args) {
    const delimiter = args.includes('-d') ? args[args.indexOf('-d') + 1] : '\t'
    const fields = args.includes('-f') ? args[args.indexOf('-f') + 1].split(',').map(Number) : [1]
    const files = args.filter(a => !a.startsWith('-') && a !== delimiter && !args[args.indexOf(a) - 1]?.match(/^-dfm$/))
    let content = ''
    if (files.length) {
      const resolved = this.resolvePath(files[0])
      const node = this.getNode(resolved)
      if (node && node.type === 'file') content = node.content || ''
    } else if (this._pipeInput) {
      content = this._pipeInput
    } else {
      return 'cut: missing file operand'
    }
    return content.split('\n').map(line => {
      const parts = line.split(delimiter)
      return fields.map(f => parts[f - 1] || '').join(delimiter)
    }).join('\n')
  }

  cmdTr(args) {
    let content = ''
    const files = args.filter(a => !a.startsWith('-'))
    if (files.length) {
      const resolved = this.resolvePath(files[0])
      const node = this.getNode(resolved)
      if (node && node.type === 'file') content = node.content || ''
    } else if (this._pipeInput) {
      content = this._pipeInput
    } else {
      return 'tr: missing file operand'
    }
    if (args.includes('-d')) {
      const chars = args[args.indexOf('-d') + 1] || ''
      return content.split('').filter(c => !chars.includes(c)).join('')
    }
    if (args[0] && args[1]) {
      const from = args[0]
      const to = args[1]
      let result = content
      for (let i = 0; i < Math.min(from.length, to.length); i++) {
        result = result.split(from[i]).join(to[i])
      }
      return result
    }
    return content
  }

  cmdSed(args) {
    let content = ''
    let expression = ''
    const files = []
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-e' && args[i + 1]) { expression = args[i + 1]; i++ }
      else if (args[i].startsWith('s/')) { expression = args[i] }
      else if (!args[i].startsWith('-')) { files.push(args[i]) }
    }
    if (!expression && args.length > 0 && args[0].includes('/')) expression = args[0]
    if (files.length) {
      const resolved = this.resolvePath(files[0])
      const node = this.getNode(resolved)
      if (node && node.type === 'file') content = node.content || ''
    } else if (this._pipeInput) {
      content = this._pipeInput
    } else {
      return 'sed: missing file operand'
    }
    if (expression.startsWith('s/')) {
      const parts = expression.split('/')
      if (parts.length >= 3) {
        const search = parts[1]
        const replace = parts[2]
        const flags = parts[3] || ''
        if (flags.includes('g')) {
          return content.split('\n').map(line => line.split(search).join(replace)).join('\n')
        }
        return content.split('\n').map(line => line.replace(search, replace)).join('\n')
      }
    }
    return content
  }

  cmdAwk(args) {
    let content = ''
    let pattern = ''
    let action = ''
    const files = []
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith('{') || args[i].startsWith('print') || args[i].startsWith('$')) {
        if (!pattern) pattern = args[i]
        else action = args[i]
      } else if (!args[i].startsWith('-')) {
        files.push(args[i])
      }
    }
    if (files.length) {
      const resolved = this.resolvePath(files[0])
      const node = this.getNode(resolved)
      if (node && node.type === 'file') content = node.content || ''
    } else if (this._pipeInput) {
      content = this._pipeInput
    } else {
      return 'awk: missing file operand'
    }
    if (action.includes('$0') || action.includes('print')) {
      return content.split('\n').map(line => {
        const fields = line.split(/\s+/)
        let result = action
        result = result.replace(/\$0/g, line)
        for (let i = 1; i <= fields.length; i++) {
          result = result.replace(new RegExp(`\\$${i}`, 'g'), fields[i - 1] || '')
        }
        return result.replace(/print\s*/g, '').replace(/[{}]/g, '').trim()
      }).join('\n')
    }
    return content
  }

  cmdDiff(args) {
    const context = args.includes('-u') ? 3 : args.includes('-C') ? parseInt(args[args.indexOf('-C') + 1]) || 3 : 0
    const files = args.filter(a => !a.startsWith('-'))
    if (files.length < 2) return 'diff: missing operand'
    const resolved1 = this.resolvePath(files[0])
    const resolved2 = this.resolvePath(files[1])
    const node1 = this.getNode(resolved1)
    const node2 = this.getNode(resolved2)
    if (!node1 || node1.type === 'dir') return `diff: ${files[0]}: No such file`
    if (!node2 || node2.type === 'dir') return `diff: ${files[1]}: No such file`
    const lines1 = (node1.content || '').split('\n')
    const lines2 = (node2.content || '').split('\n')
    if (lines1.join('\n') === lines2.join('\n')) return ''
    let result = `--- ${files[0]}\n+++ ${files[1]}\n@@ -1,${lines1.length} +1,${lines2.length} @@\n`
    for (const line of lines1) result += `-${line}\n`
    for (const line of lines2) result += `+${line}\n`
    return result
  }

  cmdComm(args) {
    const files = args.filter(a => !a.startsWith('-'))
    if (files.length < 2) return 'comm: missing operand'
    const resolved1 = this.resolvePath(files[0])
    const resolved2 = this.resolvePath(files[1])
    const node1 = this.getNode(resolved1)
    const node2 = this.getNode(resolved2)
    if (!node1 || node1.type === 'dir') return `comm: ${files[0]}: No such file`
    if (!node2 || node2.type === 'dir') return `comm: ${files[1]}: No such file`
    const lines1 = (node1.content || '').split('\n')
    const lines2 = (node2.content || '').split('\n')
    const results = []
    for (const line of lines1) {
      if (lines2.includes(line)) {
        results.push(`\t\t${line}`)
      } else {
        results.push(`${line}\t\t`)
      }
    }
    for (const line of lines2) {
      if (!lines1.includes(line)) {
        results.push(`\t\t${line}`)
      }
    }
    return results.join('\n')
  }

  cmdTee(args) {
    const append = args.includes('-a')
    const files = args.filter(a => !a.startsWith('-'))
    let content = this._pipeInput || ''
    for (const f of files) {
      const resolved = this.resolvePath(f)
      const parent = this.getParent(resolved)
      if (parent && parent.type === 'dir') {
        const name = this.getFileName(resolved)
        if (append && this.getNode(resolved)) {
          const node = this.getNode(resolved)
          node.content = (node.content || '') + '\n' + content
        } else {
          this.fs[resolved] = { type: 'file', content }
          if (!parent.children.includes(name)) parent.children.push(name)
        }
      }
    }
    return content
  }

  cmdXargs(args) {
    const command = args.join(' ')
    if (!command) return this._pipeInput || ''
    const input = (this._pipeInput || '').trim()
    if (!input) return ''
    return this.execSingle(`${command} ${input}`)
  }

  cmdDate(args) {
    const now = new Date()
    if (args.includes('+%s')) return Math.floor(now.getTime() / 1000).toString()
    if (args.includes('+%Y-%m-%d')) return now.toISOString().split('T')[0]
    if (args.includes('+%H:%M:%S')) return now.toTimeString().split(' ')[0]
    if (args.includes('+%Y%m%d%H%M%S')) {
      return now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0')
    }
    return now.toString()
  }

  cmdCal(args) {
    const now = new Date()
    const year = args[0] ? parseInt(args[0]) : now.getFullYear()
    const month = args[1] ? parseInt(args[1]) : now.getMonth() + 1
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const title = `${months[month - 1]} ${year}`
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    let cal = `    ${title}\nSu Mo Tu We Th Fr Sa\n`
    let line = '   '.repeat(firstDay)
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = String(d).padStart(2)
      if (d === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear()) {
        line += `\x1b[7m${dayStr}\x1b[0m `
      } else {
        line += dayStr + ' '
      }
      if ((firstDay + d) % 7 === 0) { cal += line.trim() + '\n'; line = '' }
    }
    if (line.trim()) cal += line.trim()
    return cal
  }

  cmdUname(args) {
    if (args.includes('-a')) return 'Linux glassos 6.1.0-glassos #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux'
    if (args.includes('-r')) return '6.1.0-glassos'
    if (args.includes('-m')) return 'x86_64'
    if (args.includes('-n')) return 'glassos'
    if (args.includes('-s')) return 'Linux'
    if (args.includes('-p')) return 'x86_64'
    if (args.includes('-o')) return 'GNU/Linux'
    return 'Linux'
  }

  cmdUptime() {
    const uptimeMs = Date.now() - this.uptime
    const days = Math.floor(uptimeMs / 86400000)
    const hours = Math.floor((uptimeMs % 86400000) / 3600000)
    const mins = Math.floor((uptimeMs % 3600000) / 60000)
    return ` 10:00:00 up ${days} day, ${hours}:${String(mins).padStart(2, '0')}, 1 user, load average: 0.15, 0.25, 0.30`
  }

  cmdFree() {
    return `              total        used        free      shared  buff/cache   available
Mem:       16384000     4096000     8192000      512000     4096000    10240000
Swap:       4096000           0     4096000`
  }

  cmdEnv() {
    return Object.entries(this.env).map(([k, v]) => `${k}=${v}`).join('\n')
  }

  cmdExport(args) {
    for (const arg of args) {
      if (arg.includes('=')) {
        const [key, ...valParts] = arg.split('=')
        this.env[key] = valParts.join('=')
      }
    }
    return ''
  }

  cmdUnset(args) {
    for (const arg of args) {
      delete this.env[arg]
    }
    return ''
  }

  cmdSet(args) {
    if (!args.length) {
      return Object.entries(this.env).map(([k, v]) => `${k}="${v}"`).join('\n')
    }
    return ''
  }

  cmdHistory() {
    return this.history.map((cmd, i) => `  ${String(i + 1).padStart(4)}  ${cmd}`).join('\n')
  }

  cmdAlias(args) {
    if (!args.length) {
      return Object.entries(this.aliases).map(([k, v]) => `alias ${k}='${v}'`).join('\n')
    }
    for (const arg of args) {
      if (arg.includes('=')) {
        const [name, ...valParts] = arg.split('=')
        this.aliases[name] = valParts.join('=').replace(/^['"]|['"]$/g, '')
      }
    }
    return ''
  }

  cmdUnalias(args) {
    for (const arg of args) {
      delete this.aliases[arg]
    }
    return ''
  }

  cmdPs(args) {
    const aux = args.includes('aux') || args.includes('-aux') || args.includes('-ef')
    const tree = args.includes('forest') || args.includes('-f')
    if (aux) {
      return `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1 169564 13260 ?        Ss   10:00   0:03 /sbin/init
root       234  0.0  0.0  72304  5120 ?        Ss   10:00   0:00 /usr/sbin/sshd -D
root       345  0.0  0.0  14896  3072 pts/0    Ss   10:00   0:00 -bash
user       456  0.3  0.4 512344 45672 pts/0    Sl   10:01   0:01 vim notes.txt
user       789  1.2  0.8 892108 125432 pts/0   R+   10:05   0:00 ps aux`
    }
    return `  PID TTY          TIME CMD
  345 pts/0    00:00:00 bash
  789 pts/0    00:00:00 ps`
  }

  cmdTop() {
    const uptimeMs = Date.now() - this.uptime
    const hours = Math.floor(uptimeMs / 3600000)
    const mins = Math.floor((uptimeMs % 3600000) / 60000)
    return `top - 10:00:01 up ${hours}:${String(mins).padStart(2, '0')}, 1 user, load average: 0.15, 0.25, 0.30
Tasks:  42 total,   1 running,  41 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.1 us,  0.8 sy,  0.0 ni, 96.9 id,  0.2 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :  16000.0 total,   8000.0 free,   4000.0 used,   4000.0 buff/cache
MiB Swap:   4000.0 total,   4000.0 free,      0.0 used.  10000.0 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    1 root      20   0  169564  13260   8520 S   0.0   0.1   0:03.42 systemd
  234 root      20   0   72304   5120   3840 S   0.0   0.0   0:00.12 sshd
  345 root      20   0   14896   3072   2048 S   0.0   0.0   0:00.05 bash
  456 user      20   0  512344  45672  32100 S   0.3   0.3   0:01.23 vim
  789 user      20   0  892108 125432  67890 R   1.2   0.8   0:00.45 top`
  }

  cmdKill(args) {
    const signal = args.includes('-9') ? 9 : args.includes('-15') ? 15 : 15
    const pids = args.filter(a => !a.startsWith('-') && !isNaN(a))
    if (!pids.length) return `kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]`
    return pids.map(pid => `bash: kill: (${pid}) - No such process`).join('\n')
  }

  cmdJobs() {
    if (!this.jobs.length) return ''
    return this.jobs.map((job, i) => `[${i + 1}] ${job.status} ${job.command}`).join('\n')
  }

  cmdChmod(args) {
    const files = args.filter(a => !a.startsWith('-') && !/^[0-7]+$/.test(a))
    const mode = args.find(a => /^[0-7]+$/.test(a) || /^[augo]+[+-=][rwx]+$/.test(a))
    if (!mode || !files.length) return 'chmod: missing operand'
    return ''
  }

  cmdChown(args) {
    const files = args.filter(a => !a.startsWith('-') && !a.includes(':'))
    const owner = args.find(a => a.includes(':') || (!a.startsWith('-') && !files.includes(a)))
    if (!owner || !files.length) return 'chown: missing operand'
    return ''
  }

  cmdChgrp(args) {
    const files = args.filter(a => !a.startsWith('-'))
    const group = args.find(a => !a.startsWith('-') && !files.includes(a))
    if (!group || !files.length) return 'chgrp: missing operand'
    return ''
  }

  cmdTar(args) {
    const create = args.includes('-c') || args.includes('-czf')
    const extract = args.includes('-x') || args.includes('-xzf')
    const file = args.includes('-f') ? args[args.indexOf('-f') + 1] : null
    const gzip = args.includes('-z')
    const verbose = args.includes('-v')
    if (create && file) {
      return `tar: ${file}: file not found in simulated environment`
    }
    if (extract && file) {
      return `tar: ${file}: Cannot open: No such file or directory in simulated environment`
    }
    return 'tar: You must specify one of -c, -x, -t, -r, -u, -d'
  }

  cmdGzip(args) {
    const files = args.filter(a => !a.startsWith('-'))
    if (!files.length) return 'gzip: missing file operand'
    return files.map(f => `gzip: ${f}: simulated`).join('\n')
  }

  cmdGunzip(args) {
    const files = args.filter(a => !a.startsWith('-'))
    if (!files.length) return 'gunzip: missing file operand'
    return files.map(f => `gunzip: ${f}: simulated`).join('\n')
  }

  cmdZip(args) {
    const files = args.filter(a => !a.startsWith('-'))
    if (!files.length) return 'zip: missing file operand'
    return `  adding: ${files[0]} (stored 0%)`
  }

  cmdUnzip(args) {
    const files = args.filter(a => !a.startsWith('-'))
    if (!files.length) return 'unzip: missing file operand'
    return `Archive:  ${files[0]}\n  inflating: extracted_file.txt`
  }

  cmdCurl(args) {
    const url = args.find(a => a.startsWith('http'))
    if (!url) return 'curl: try \'curl --help\' for more information'
    if (args.includes('-I') || args.includes('--head')) {
      return `HTTP/1.1 200 OK\nContent-Type: text/html\nContent-Length: 1234\nDate: ${new Date().toUTCString()}`
    }
    if (args.includes('-o')) {
      return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current\n                                 Dload  Upload   Total   Spent    Left  Speed\n100  1234  100  1234    0     0  12340      0 --:--:-- --:--:-- --:--:-- 12340`
    }
    return `<!DOCTYPE html>\n<html>\n<head><title>GlassOS</title></head>\n<body><h1>Hello from GlassOS Linux!</h1></body>\n</html>`
  }

  cmdWget(args) {
    const url = args.find(a => a.startsWith('http'))
    if (!url) return 'wget: missing URL'
    return `--2026-06-28 10:00:00--  ${url}\nResolving glassos.local... 127.0.0.1\nConnecting to glassos.local|127.0.0.1|:80... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 1234 (1.2K) [text/html]\nSaving to: 'index.html'\n\nindex.html          100%[===================>]   1.21K  --.-KB/s    in 0s\n\n2026-06-28 10:00:01 (12.1 MB/s) - 'index.html' saved [1234/1234]`
  }

  cmdPing(args) {
    const host = args.find(a => !a.startsWith('-')) || 'localhost'
    const count = args.includes('-c') ? parseInt(args[args.indexOf('-c') + 1]) || 4 : 4
    const results = [`PING ${host} (127.0.0.1) 56(84) bytes of data.`]
    for (let i = 0; i < count; i++) {
      const time = (Math.random() * 10 + 1).toFixed(3)
      results.push(`64 bytes from 127.0.0.1: icmp_seq=${i + 1} ttl=64 time=${time} ms`)
    }
    results.push(`\n--- ${host} ping statistics ---`)
    results.push(`${count} packets transmitted, ${count} received, 0% packet loss, time ${count * 1000}ms`)
    results.push(`rtt min/avg/max/mdev = 1.000/5.000/10.000/3.000 ms`)
    return results.join('\n')
  }

  cmdIfconfig() {
    return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255\n        inet6 fe80::1  prefixlen 64  scopeid 0x20<link>\n        ether 00:11:22:33:44:55  txqueuelen 1000  (Ethernet)\n        RX packets 1234567  bytes 1234567890 (1.2 GB)\n        RX errors 0  dropped 0  overruns 0  frame 0\n        TX packets 987654  bytes 987654321 (987.6 MB)\n        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0\n\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0\n        inet6 ::1  prefixlen 128  scopeid 0x10<host>\n        loop  txqueuelen 1000  (Local Loopback)\n        RX packets 1234  bytes 123456 (123.4 KB)\n        RX errors 0  dropped 0  overruns 0  frame 0\n        TX packets 1234  bytes 123456 (123.4 KB)\n        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0`
  }

  cmdIp(args) {
    if (args[0] === 'addr' || args[0] === 'a') return this.cmdIfconfig()
    if (args[0] === 'route' || args[0] === 'r') {
      return `default via 192.168.1.1 dev eth0\n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100`
    }
    if (args[0] === 'link' || args[0] === 'l') {
      return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP\n    link/ether 00:11:22:33:44:55 brd ff:ff:ff:ff:ff:ff`
    }
    return 'Usage: ip [ addr | link | route ]'
  }

  cmdNetstat() {
    return `Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN
tcp        0      0 192.168.1.100:22        192.168.1.100:54321     ESTABLISHED
udp        0      0 0.0.0.0:68              0.0.0.0:*
udp        0      0 0.0.0.0:5353            0.0.0.0:*

Active UNIX domain sockets (servers and established)
Proto RefCnt Flags       Type       State         I-Node   Path
unix  2      [ ACC ]     STREAM     LISTENING     12345    /var/run/mysqld/mysqld.sock
unix  3      [ ]         DGRAM      CONNECTED     12346    /dev/log`
  }

  cmdNslookup(args) {
    const host = args[0] || 'localhost'
    return `Server:\t\t127.0.0.1\nAddress:\t127.0.0.1#53\n\nNon-authoritative answer:\nName:\t${host}\nAddress: 127.0.0.1`
  }

  cmdSsh(args) {
    const host = args.find(a => !a.startsWith('-')) || ''
    if (!host) return 'usage: ssh [-p port] [user@]hostname [command]'
    return `ssh: connect to host ${host}: Connection refused\n(simulated - no real SSH connection)`
  }

  cmdGit(args) {
    if (!args.length || args[0] === 'version') return 'git version 2.42.0 (simulated)'
    if (args[0] === 'status') return `On branch main\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n\n\tmodified:   src/main.c\n\nno changes added to commit (use "git add" and/or "git commit")`
    if (args[0] === 'log') {
      return `commit a1b2c3d4e5f6 (HEAD -> main)\nAuthor: GlassOS User <user@glassos.local>\nDate:   Sat Jun 28 10:00:00 2026 +0800\n\n    feat: add system info function\n\ncommit b2c3d4e5f6g7\nAuthor: GlassOS User <user@glassos.local>\nDate:   Fri Jun 27 15:30:00 2026 +0800\n\n    init: project setup`
    }
    if (args[0] === 'branch') return '* main\n  develop\n  feature-x'
    if (args[0] === 'add') return ''
    if (args[0] === 'commit') return `[main abc1234] commit message\n 1 file changed, 10 insertions(+), 2 deletions(-)`
    if (args[0] === 'diff') return `--- a/src/main.c\n+++ b/src/main.c\n@@ -1,5 +1,8 @@\n #include <stdio.h>\n+#include <stdlib.h>\n \n-int main() {\n+int main(int argc, char *argv[]) {\n+    if (argc < 2) {\n+        printf("Usage: %s <name>\\n", argv[0]);\n+        return 1;\n+    }\n+    printf("Hello, %s!\\n", argv[1]);\n     return 0;\n }`
    if (args[0] === 'push') return 'Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nDelta compression using up to 8 threads\nCompressing objects: 100% (3/3), done.\nWriting objects: 100% (3/3), 325 bytes | 325.00 KiB/s, done.\nTotal 3 (delta 1), reused 0 (delta 0), pack-reused 0'
    if (args[0] === 'pull') return 'Already up to date.'
    if (args[0] === 'clone') return `Cloning into '${args[1] || 'repo'}'...\nremote: Enumerating objects: 100, done.\nremote: Total 100 (delta 0), reused 0 (delta 0), pack-reused 100\nReceiving objects: 100% (100/100), 10.00 KiB | 10.00 KiB/s, done.`
    if (args[0] === 'remote') return 'origin\thttps://github.com/user/repo.git (fetch)\norigin\thttps://github.com/user/repo.git (push)'
    if (args[0] === 'stash') return 'No local changes to save'
    if (args[0] === 'tag') return 'v1.0.0'
    if (args[0] === 'checkout') return `Switched to branch '${args[1] || 'main'}'`
    if (args[0] === 'merge') return `Updating abc1234..def5678\nFast-forward\n src/main.c | 5 +++++\n 1 file changed, 5 insertions(+)`
    return `git: '${args[0]}' is not a git command. See 'git --help'.\n\nThe most similar command is\n\tgui`
  }

  cmdVim(args) {
    const file = args[0] || ''
    if (!file) return '# vim (simulated - use "vim <file>" to edit)'
    const resolved = this.resolvePath(file)
    const node = this.getNode(resolved)
    if (node) {
      return `# vim: editing ${file}\n# (simulated - file content would be shown here)\n# :wq to save and quit\n# :q! to quit without saving`
    }
    return `# vim: new file ${file}\n# (simulated - would create new file)`
  }

  cmdPython(args) {
    if (args.includes('--version') || args.includes('-V')) return 'Python 3.11.0 (main, Jun 28 2026, 10:00:00) [GCC 11.3.0] on linux'
    if (args.includes('-c') && args[2]) {
      try {
        return eval(args[2])
      } catch (e) {
        return `Traceback (most recent call last):\n  File "<stdin>", line 1, in <module>\n${e.message || e}`
      }
    }
    return `Python 3.11.0 (main, Jun 28 2026, 10:00:00) [GCC 11.3.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>> `
  }

  cmdGcc(args) {
    if (args.includes('--version')) return 'gcc (Ubuntu 11.3.0-1ubuntu1~22.04) 11.3.0'
    const file = args.find(a => a.endsWith('.c'))
    if (!file) return 'gcc: fatal error: no input files\ncompilation terminated.'
    return `# compiled ${file} successfully (simulated)`
  }

  cmdMake(args) {
    if (args.includes('-v') || args.includes('--version')) return 'GNU Make 4.3\nBuilt for x86_64-pc-linux-gnu'
    return `make: *** No targets specified and no makefile found.  Stop.`
  }

  cmdApt(args) {
    if (args[0] === 'update') {
      return `Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease\nHit:2 http://archive.ubuntu.com/ubuntu jammy-updates InRelease\nHit:3 http://archive.ubuntu.com/ubuntu jammy-security InRelease\nReading package lists... Done\nBuilding dependency tree... Done\nAll packages are up to date.`
    }
    if (args[0] === 'upgrade') {
      return `Reading package lists... Done\nBuilding dependency tree... Done\nCalculating upgrade... Done\n0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.`
    }
    if (args[0] === 'install') {
      const pkg = args[1] || 'package'
      return `Reading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  ${pkg}\n0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.\nNeed to get 1234 kB of archives.\nAfter this operation, 5678 kB of additional disk space will be used.\nGet:1 http://archive.ubuntu.com/ubuntu ${pkg} 1.0.0 [1234 kB]\nFetched 1234 kB in 1s (1234 kB/s)\nSelecting previously unselected package ${pkg}.\n(Reading database ... 123456 files and directories currently installed.)\nPreparing to unpack .../${pkg}_1.0.0_amd64.deb ...\nUnpacking ${pkg} (1.0.0) ...\nSetting up ${pkg} (1.0.0) ...`
    }
    if (args[0] === 'remove' || args[0] === 'purge') {
      const pkg = args[1] || 'package'
      return `Reading package lists... Done\nBuilding dependency tree... Done\nThe following packages will be REMOVED:\n  ${pkg}\n0 upgraded, 0 newly installed, 1 to remove and 0 not upgraded.\nAfter this operation, 5678 kB disk space will be freed.\n(Reading database ... 123456 files and directories currently installed.)\nRemoving ${pkg} (1.0.0) ...\nProcessing triggers for man-db (2.10.2) ...`
    }
    if (args[0] === 'search') {
      const pkg = args[1] || 'package'
      return `Sorting... Done\nFull Text Search... Done\n${pkg}/jammy 1.0.0 amd64\n  Description: ${pkg} package\n  This is a simulated package.`
    }
    if (args[0] === 'list' || args[0] === 'ls') {
      return `Listing...\napt/jammy,now 2.4.1 amd64 [installed]\nbash/jammy,now 5.1.16-1ubuntu3 amd64 [installed]\ncurl/jammy,now 7.81.0-1ubuntu1.7 amd64 [installed]\ngit/jammy,now 1:2.34.1-1ubuntu1.10 amd64 [installed]\nvim/jammy,now 2:9.1.0000-1ubuntu1 amd64 [installed]`
    }
    if (args[0] === 'show') {
      const pkg = args[1] || 'apt'
      return `Package: ${pkg}\nVersion: 2.4.1\nPriority: optional\nSection: admin\nMaintainer: Ubuntu Developers <ubuntu-devel@lists.ubuntu.com>\nInstalled-Size: 4096\nDepends: libc6 (>= 2.17), libgcc-s1 (>= 4.2)\nHomepage: https://apt.aptitude.org\nDescription: commandline package manager\n APT package management utility.`
    }
    return 'Usage: apt [options] command\n\nCommands:\n  list - list packages\n  search - search in package descriptions\n  show - show package details\n  install - install packages\n  remove - remove packages\n  update - update list of available packages\n  upgrade - upgrade the system'
  }

  cmdDpkg(args) {
    if (args.includes('-l') || args.includes('--list')) {
      return `Desired=Unknown/Install/Remove/Purge/Hold\n| Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend\n|/ Err?=(none)/Reinst-required (Status,Err: uppercase=bad)\n||/ Name           Version      Architecture Description\n+++-==============-============-============-=================================\nii  apt            2.4.1        amd64        commandline package manager\nii  bash           5.1.16-1ubu amd64        GNU Bourne Again SHell\nii  curl           7.81.0-1ubu amd64        command line tool for transferring\nii  git            2.34.1-1ubu amd64        fast, scalable, distributed revisi\nii  vim            9.1.0000-1u amd64        Vi IMproved - enhanced vi editor`
    }
    if (args.includes('-s') || args.includes('--status')) {
      const pkg = args.find(a => !a.startsWith('-'))
      return `Package: ${pkg || 'apt'}\nStatus: install ok installed\nPriority: optional\nSection: admin\nInstalled-Size: 4096\nMaintainer: Ubuntu Developers <ubuntu-devel@lists.ubuntu.com>\nArchitecture: amd64\nVersion: 2.4.1\nDepends: libc6 (>= 2.17), libgcc-s1 (>= 4.2)`
    }
    return 'Usage: dpkg [<option> ...] <command>\n\nCommands:\n  -l, --list           List packages\n  -s, --status         Package status details\n  -i, --install        Install package'
  }

  cmdSystemctl(args) {
    if (args[0] === 'status') {
      const service = args[1] || 'glassos'
      return `● ${service}.service - GlassOS Service\n     Loaded: loaded (/lib/systemd/system/${service}.service; enabled; vendor preset: enabled)\n     Active: active (running) since Sat 2026-06-28 10:00:00 CST; 1 day ago\n   Main PID: 1234 (${service})\n      Tasks: 5 (limit: 19660)\n     Memory: 12.3M\n        CPU: 1.234s\n     CGroup: /system.slice/${service}.service\n             └─1234 /usr/sbin/${service}`
    }
    if (args[0] === 'start') return ''
    if (args[0] === 'stop') return ''
    if (args[0] === 'restart') return ''
    if (args[0] === 'enable') return ''
    if (args[0] === 'disable') return ''
    if (args[0] === 'list-units') {
      return `UNIT                     LOAD   ACTIVE SUB     DESCRIPTION\naccounts-daemon.service  loaded active running Accounts Service\ncron.service             loaded active running Regular background program processing\ndbus.service             loaded active running D-Bus System Message Bus\ngetty@tty1.service       loaded active running Getty on tty1\nglassos.service          loaded active running GlassOS Service\nnetworkd.service         loaded active running Network Manager\nsshd.service             loaded active running OpenSSH server\nsystemd-logind.service   loaded active running Login Service`
    }
    return 'Usage: systemctl [COMMAND] [SERVICE]\n\nCommands:\n  start     Start a service\n  stop      Stop a service\n  restart   Restart a service\n  status    Check service status\n  enable    Enable service at boot\n  disable   Disable service at boot'
  }

  cmdService(args) {
    return `Usage: service <service> <command>\n\nCommands: start, stop, restart, status`
  }

  cmdMount(args) {
    if (args.includes('-a') || args.length === 0) {
      return `/dev/sda1 on / type ext4 (rw,relatime,errors=remount-ro)\ntmpfs on /tmp type tmpfs (rw,nosuid,nodev)\n/dev/sda2 on /home type ext4 (rw,relatime)\nproc on /proc type proc (rw,nosuid,nodev,noexec,relatime)\nsysfs on /sys type sysfs (rw,nosuid,nodev,noexec,relatime)\nudev on /dev type devtmpfs (rw,nosuid,relatime,size=8192000k)\ndevpts on /dev/pts type devpts (rw,nosuid,noexec,relatime,gid=5,mode=620)`
    }
    const device = args[0] || '/dev/sda1'
    const mountpoint = args[1] || '/mnt'
    return `mount: ${device} mounted on ${mountpoint}`
  }

  cmdUmount(args) {
    const target = args[0] || '/mnt'
    return `umount: ${target} unmounted`
  }

  cmdWhereis(args) {
    const cmd = args[0] || ''
    const paths = {
      'bash': 'bash: /usr/bin/bash /etc/bash.bashrc /usr/share/man/man1/bash.1.gz',
      'vim': 'vim: /usr/bin/vim /etc/vim /usr/share/vim /usr/share/man/man1/vim.1.gz',
      'git': 'git: /usr/bin/git /usr/share/man/man1/git.1.gz',
      'python3': 'python3: /usr/bin/python3.11 /usr/share/man/man1/python3.1.gz',
      'gcc': 'gcc: /usr/bin/gcc-11 /usr/lib/gcc /usr/share/man/man1/gcc.1.gz',
      'make': 'make: /usr/bin/make /usr/share/man/man1/make.1.gz',
    }
    return paths[cmd] || `${cmd} not found`
  }

  cmdType(args) {
    const cmd = args[0] || ''
    const builtins = ['cd', 'echo', 'export', 'unset', 'set', 'alias', 'unalias', 'history', 'exit', 'logout', 'type', 'source', 'exec', 'eval', 'shift', 'read', 'test', 'true', 'false']
    const keywords = ['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'function', 'select', 'time', 'until', 'coproc', 'in']
    if (builtins.includes(cmd)) return `${cmd} is a shell builtin`
    if (keywords.includes(cmd)) return `${cmd} is a shell keyword`
    const executables = ['ls', 'cat', 'grep', 'find', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'chmod', 'chown', 'head', 'tail', 'wc', 'sort', 'uniq', 'cut', 'tr', 'sed', 'awk', 'date', 'cal', 'ps', 'top', 'kill', 'df', 'du', 'free', 'ping', 'curl', 'wget', 'ssh', 'git', 'tar', 'zip', 'unzip', 'make', 'gcc', 'python3', 'vim']
    if (executables.includes(cmd)) return `${cmd} is /usr/bin/${cmd}`
    return `bash: type: ${cmd}: not found`
  }

  cmdStat(args) {
    const file = args.find(a => !a.startsWith('-'))
    if (!file) return 'stat: missing operand'
    const resolved = this.resolvePath(file)
    const node = this.getNode(resolved)
    if (!node) return `stat: cannot stat '${file}': No such file or directory`
    const isDir = node.type === 'dir'
    return `  File: ${file}\n  Size: ${isDir ? 4096 : (node.content || '').length}\tBlocks: 8\t\tIO Block: 4096\t${isDir ? 'directory' : 'regular file'}\nAccess: (0${isDir ? '755' : '644'}/${isDir ? 'rwxr-xr-x' : 'rw-r--r--'})\tUid: ( 1000/   user)\tGid: ( 1000/   user)\nAccess: 2026-06-28 10:00:00.000000000 +0800\nModify: 2026-06-28 10:00:00.000000000 +0800\nChange: 2026-06-28 10:00:00.000000000 +0800\n Birth: 2026-06-28 10:00:00.000000000 +0800`
  }

  cmdTree(args) {
    const showAll = args.includes('-a')
    const target = args.find(a => !a.startsWith('-')) || '.'
    const resolved = this.resolvePath(target)
    const node = this.getNode(resolved)
    if (!node || node.type !== 'dir') return `tree: '${target}' [error opening dir]`
    const lines = [resolved === '.' ? '.' : target]
    let dirs = 0, files = 0
    const buildTree = (path, prefix) => {
      const n = this.getNode(path)
      if (!n || n.type !== 'dir') return
      const children = showAll ? n.children : n.children.filter(c => !c.startsWith('.'))
      children.forEach((child, i) => {
        const isLast = i === children.length - 1
        const connector = isLast ? '└── ' : '├── '
        const childPath = path === '/' ? '/' + child : path + '/' + child
        const childNode = this.getNode(childPath)
        if (childNode && childNode.type === 'dir') {
          lines.push(`${prefix}${connector}\x1b[1;34m${child}\x1b[0m`)
          dirs++
          buildTree(childPath, prefix + (isLast ? '    ' : '│   '))
        } else {
          lines.push(`${prefix}${connector}${child}`)
          files++
        }
      })
    }
    buildTree(resolved, '')
    lines.push(`\n${dirs} directories, ${files} files`)
    return lines.join('\n')
  }

  cmdDu(args) {
    const showAll = args.includes('-a')
    const humanReadable = args.includes('-h')
    const total = args.includes('-s') || args.includes('-sh')
    const target = args.find(a => !a.startsWith('-')) || '.'
    const resolved = this.resolvePath(target)
    const results = []
    const calcSize = (path) => {
      const node = this.getNode(path)
      if (!node) return 0
      if (node.type === 'file') return (node.content || '').length
      let size = 4096
      for (const child of node.children) {
        const childPath = path === '/' ? '/' + child : path + '/' + child
        const childSize = calcSize(childPath)
        if (showAll) {
          const sizeStr = humanReadable ? this.formatSize(childSize) : childSize
          results.push(`${sizeStr}\t${childPath}`)
        }
        size += childSize
      }
      return size
    }
    const size = calcSize(resolved)
    const sizeStr = humanReadable ? this.formatSize(size) : size
    if (total) {
      results.push(`${sizeStr}\t${target}`)
    } else if (showAll) {
      results.push(`${sizeStr}\t${target}`)
    } else {
      results.push(`${sizeStr}\t${target}`)
    }
    return results.join('\n')
  }

  cmdDf(args) {
    const human = args.includes('-h')
    const header = `Filesystem      ${human ? 'Size' : '1K-blocks'} ${human ? 'Used' : 'Used'} ${human ? 'Avail' : 'Available'} Use% Mounted on`
    if (human) {
      return `${header}\n/dev/sda1        2.0G   1.4G   442M   76% /\ntmpfs            7.9G      0   7.9G    0% /dev/shm\n/dev/sda2        7.8G   2.1G   5.3G   29% /home`
    }
    return `${header}\n/dev/sda1       2097152 1468006  452300   77% /\ntmpfs            8192000       0 8192000    0% /dev/shm\n/dev/sda2       8192000 2199000 5993000   27% /home`
  }

  cmdSeq(args) {
    let start = 1, end = 10, step = 1
    if (args.length === 1) end = parseInt(args[0]) || 10
    else if (args.length === 2) { start = parseInt(args[0]) || 1; end = parseInt(args[1]) || 10 }
    else if (args.length === 3) { start = parseInt(args[0]) || 1; step = parseInt(args[1]) || 1; end = parseInt(args[2]) || 10 }
    const results = []
    for (let i = start; step > 0 ? i <= end : i >= end; i += step) results.push(i)
    return results.join('\n')
  }

  cmdBc(args) {
    if (args.includes('-l')) return '# bc math library loaded\n1.000000000'
    const expr = args.join(' ')
    if (!expr) return 'bc 1.07.1\nCopyright 1991-1995, 1997-2018, 2020 Free Software Foundation, Inc.\nThis is free software with ABSOLUTELY NO WARRANTY.\nType \'copyright\' for details.\n'
    try {
      const result = Function('"use strict";return (' + expr.replace(/[^0-9+\-*/().%\s]/g, '') + ')')()
      return String(result)
    } catch { return 'error' }
  }

  cmdExpr(args) {
    try {
      const expr = args.join(' ')
      const result = Function('"use strict";return (' + expr.replace(/[^0-9+\-*/().%\s]/g, '') + ')')()
      return String(result)
    } catch { return 'expr: syntax error' }
  }

  cmdTest(args) {
    if (args.includes('-f')) {
      const file = args.find(a => !a.startsWith('-') && a !== '-f')
      const resolved = this.resolvePath(file)
      const node = this.getNode(resolved)
      return node && node.type === 'file' ? '' : 'test'
    }
    if (args.includes('-d')) {
      const dir = args.find(a => !a.startsWith('-') && a !== '-d')
      const resolved = this.resolvePath(dir)
      const node = this.getNode(resolved)
      return node && node.type === 'dir' ? '' : 'test'
    }
    if (args.includes('-e')) {
      const path = args.find(a => !a.startsWith('-') && a !== '-e')
      const resolved = this.resolvePath(path)
      return this.getNode(resolved) ? '' : 'test'
    }
    if (args.includes('-z')) {
      const str = args.find(a => !a.startsWith('-') && a !== '-z')
      return !str ? '' : 'test'
    }
    if (args.includes('-n')) {
      const str = args.find(a => !a.startsWith('-') && a !== '-n')
      return str ? '' : 'test'
    }
    if (args.includes('=')) {
      const eqIdx = args.indexOf('=')
      return args[eqIdx - 1] === args[eqIdx + 1] ? '' : 'test'
    }
    if (args.includes('!=')) {
      const neIdx = args.indexOf('!=')
      return args[neIdx - 1] !== args[neIdx + 1] ? '' : 'test'
    }
    if (args.includes('-eq')) {
      const idx = args.indexOf('-eq')
      return parseInt(args[idx - 1]) === parseInt(args[idx + 1]) ? '' : 'test'
    }
    if (args.includes('-ne')) {
      const idx = args.indexOf('-ne')
      return parseInt(args[idx - 1]) !== parseInt(args[idx + 1]) ? '' : 'test'
    }
    if (args.includes('-lt')) {
      const idx = args.indexOf('-lt')
      return parseInt(args[idx - 1]) < parseInt(args[idx + 1]) ? '' : 'test'
    }
    if (args.includes('-le')) {
      const idx = args.indexOf('-le')
      return parseInt(args[idx - 1]) <= parseInt(args[idx + 1]) ? '' : 'test'
    }
    if (args.includes('-gt')) {
      const idx = args.indexOf('-gt')
      return parseInt(args[idx - 1]) > parseInt(args[idx + 1]) ? '' : 'test'
    }
    if (args.includes('-ge')) {
      const idx = args.indexOf('-ge')
      return parseInt(args[idx - 1]) >= parseInt(args[idx + 1]) ? '' : 'test'
    }
    return args.length ? '' : 'test: missing expression'
  }

  cmdSudo(args) {
    if (!args.length) return 'usage: sudo [-h] command'
    if (args[0] === '-l') return '    User user may run the following commands on glassos:\n        (ALL : ALL) ALL'
    return `# sudo: executing '${args.join(' ')}' as root (simulated)`
  }

  cmdHelp() {
    return `\x1b[1;36m╔══════════════════════════════════════════════════════════════════╗
║              GlassOS Linux 命令练习环境                          ║
║              完整版 - 支持 200+ 命令                             ║
╚══════════════════════════════════════════════════════════════════╝\x1b[0m

\x1b[1;33m文件操作:\x1b[0m
  ls [-laAhR]        列出目录内容        cp [-rvf] <s> <d>  复制文件
  cd <dir>           切换目录            mv [-vf] <s> <d>   移动/重命名
  pwd                显示当前路径        ln [-s] <t> <l>    创建链接
  cat [-n] <f>       显示文件内容        rm [-rfi] <p>      删除文件/目录
  touch <file>       创建空文件          rmdir <dir>        删除空目录
  mkdir [-p] <dir>   创建目录            chmod <m> <f>      修改权限
  stat <file>        文件详细信息        chown <o> <f>      修改所有者

\x1b[1;33m文本处理:\x1b[0m
  echo [-n] <text>   输出文本            head [-n N] <f>    显示前N行
  grep [-invwc] <p>  搜索文本            tail [-n N] <f>    显示后N行
  sed 's/a/b/' <f>  流编辑器            sort [-rnuf] <f>   排序
  awk '{print $1}'   文本处理            uniq [-cd] <f>     去重
  cut -d: -f1 <f>    按列提取            tr 'a-z' 'A-Z'    字符转换
  wc [-lwc] <f>      统计                diff <a> <b>       比较文件
  tee [-a] <f>       保存并显示          xargs <cmd>        参数传递

\x1b[1;33m查找:\x1b[0m
  find [p] -name <n> 查找文件            locate <n>         快速查找
  which <cmd>        查找命令            whereis <cmd>      查找相关文件
  type <cmd>         显示命令类型

\x1b[1;33m系统信息:\x1b[0m
  whoami             当前用户            hostname           主机名
  id                 用户信息            groups             用户组
  uname [-a]         系统信息            uptime             运行时间
  date [+fmt]        当前时间            cal [y] [m]        日历
  env                环境变量            export             设置环境变量
  unset              取消变量            set                显示变量

\x1b[1;33m进程管理:\x1b[0m
  ps [aux/ef]        进程列表            top                系统监控
  kill [-9] <pid>    终止进程            killall <cmd>      按名称终止
  jobs               后台任务            fg                  前台任务
  bg                 后台继续            nohup              不挂断运行

\x1b[1;33m磁盘与存储:\x1b[0m
  df [-h]            磁盘使用            du [-ahs]          目录大小
  free               内存使用            lsblk              块设备
  mount [-a]         挂载                umount             卸载
  fdisk              分区信息

\x1b[1;33m网络 (真实执行):\x1b[0m
  ssh <user@host>     远程连接            ssh -p 22 <h>      指定端口
  scp <s> <d>         文件传输            scp -P 22 <s> <d>  指定端口
  ssh-keygen          生成密钥            ssh-copy-id <h>    复制公钥
  ping [-c N] <h>     测试连接            curl [-I] <url>    HTTP请求
  wget <url>          下载文件            nmap <host>        端口扫描
  ifconfig            网络接口            ip [a|r|l]         网络管理
  netstat/ss          网络状态            nslookup <h>       DNS查询
  traceroute <h>      路由追踪            nc <host> <port>   网络连接

\x1b[90m  提示: ssh/scp/ping/curl/wget/nmap 等命令会真实执行!\x1b[0m

\x1b[1;33m压缩打包:\x1b[0m
  tar [-xzvf] <f>    打包/解包           gzip <f>           压缩
  gunzip <f>         解压                zip <f> <files>    压缩
  unzip <f>          解压

\x1b[1;33m软件管理:\x1b[0m
  apt [i|remove|u]   包管理              dpkg [-l|s]        包信息
  systemctl <cmd>    服务管理            service <s> <c>    服务控制

\x1b[1;33m开发工具:\x1b[0m
  git <cmd>          版本控制            vim <file>         文本编辑
  python3 [-c]       Python              gcc [-o] <f>       编译C
  make               构建工具            npm/node/yarn      Node.js

\x1b[1;33mShell功能:\x1b[0m
  alias [n=v]        创建别名            unalias <n>        删除别名
  history            命令历史            clear/reset        清屏
  man <cmd>          帮助手册            which <cmd>        查找命令
  tree [-a] [d]      目录树              neofetch           系统信息

\x1b[1;33m管道与重定向:\x1b[0m
  cmd1 | cmd2        管道                cmd > file         输出到文件
  cmd >> file        追加到文件          cmd1 && cmd2       顺序执行
  cmd1 ; cmd2        顺序执行

\x1b[1;33m测试与条件:\x1b[0m
  test/-e/-f/-d/-z/-n 文件测试            [ -eq/-ne/-lt/-le/-gt/-ge ] 比较
  echo \$?            退出码

\x1b[90m提示: 支持 ~ (home), .. (上级), \$VAR (环境变量), 管道 |, 重定向 > >>\x1b[0m`
  }

  cmdMan(args) {
    if (!args.length) return 'What manual page do you want?\nFor example, try \'man ls\'.'
    const manPages = {
      'ls': 'LS(1)                    User Commands                    LS(1)\n\nNAME\n       ls - list directory contents\n\nSYNOPSIS\n       ls [OPTION]... [FILE]...\n\nDESCRIPTION\n       List information about the FILEs.\n\n       -a     do not ignore entries starting with .\n       -l     use a long listing format\n       -A     do not list implied . and ..\n       -h     with -l, print sizes in human readable format\n       -R     list subdirectories recursively',
      'cd': 'CD(1)                    Shell Builtin Commands                CD(1)\n\nNAME\n       cd - change working directory\n\nSYNOPSIS\n       cd [dir]\n\nDESCRIPTION\n       Change the shell working directory.\n       cd ~      go to home directory\n       cd ..     go to parent directory\n       cd -      go to previous directory',
      'cat': 'CAT(1)                   User Commands                   CAT(1)\n\nNAME\n       cat - concatenate files and print on the standard output\n\nSYNOPSIS\n       cat [FILE]...\n\nDESCRIPTION\n       Concatenate FILE(s) to standard output.\n\n       -n     number all output lines',
      'grep': 'GREP(1)                  User Commands                  GREP(1)\n\nNAME\n       grep - print lines that match patterns\n\nSYNOPSIS\n       grep [OPTION]... PATTERN [FILE]...\n\nDESCRIPTION\n       grep searches for PATTERNs in each FILE.\n\n       -i     ignore case\n       -c     count matching lines\n       -n     prefix each line with line number\n       -v     select non-matching lines\n       -w     match whole words only\n       -l     print only filenames',
      'find': 'FIND(1)                  User Commands                  FIND(1)\n\nNAME\n       find - search for files in a directory hierarchy\n\nSYNOPSIS\n       find [path] [expression]\n\nDESCRIPTION\n       find recursively searches the directory tree.\n\n       -name pattern   match filename pattern\n       -type f|d       match file type\n       -maxdepth n     maximum search depth\n       -exec cmd {} \\; execute command',
      'grep': 'GREP(1)                  User Commands                  GREP(1)\n\nNAME\n       grep - print lines that match patterns\n\nSYNOPSIS\n       grep [OPTION]... PATTERN [FILE]...\n\nDESCRIPTION\n       grep searches for PATTERNs in each FILE.\n\n       -i     ignore case\n       -c     count matching lines\n       -n     prefix each line with line number\n       -v     select non-matching lines\n       -w     match whole words only\n       -E     extended regex',
      'tar': 'TAR(1)                   User Commands                   TAR(1)\n\nNAME\n       tar - The GNU version of the tar archiving utility\n\nSYNOPSIS\n       tar [OPTION...] [FILE]...\n\nDESCRIPTION\n       GNU tar saves many files together into a single tape or disk archive.\n\n       -c     create archive\n       -x     extract archive\n       -f     archive file\n       -z     filter through gzip\n       -v     verbose',
      'chmod': 'CHMOD(1)                 User Commands                 CHMOD(1)\n\nNAME\n       chmod - change permissions of a file\n\nSYNOPSIS\n       chmod [MODE] FILE...\n\nDESCRIPTION\n       Changes the permissions of each FILE to MODE.\n\n       MODE can be octal (755) or symbolic (u+x, g-w, o=r)',
    }
    return manPages[args[0]] || `No manual entry for ${args[0]}`
  }

  cmdWhich(args) {
    if (!args.length) return ''
    const allCmds = Object.keys({
      'ls':1,'cd':1,'cat':1,'echo':1,'mkdir':1,'touch':1,'rm':1,'cp':1,'mv':1,
      'grep':1,'find':1,'head':1,'tail':1,'wc':1,'sort':1,'uniq':1,'cut':1,'tr':1,'sed':1,'awk':1,
      'chmod':1,'chown':1,'ln':1,'rmdir':1,'diff':1,'tee':1,'xargs':1,
      'pwd':1,'env':1,'export':1,'unset':1,'set':1,'alias':1,'unalias':1,'history':1,
      'clear':1,'reset':1,'help':1,'man':1,'which':1,'whereis':1,'type':1,'file':1,'stat':1,
      'tree':1,'du':1,'df':1,'free':1,'ps':1,'top':1,'kill':1,'killall':1,'jobs':1,'fg':1,'bg':1,
      'date':1,'cal':1,'uptime':1,'uname':1,'whoami':1,'id':1,'groups':1,'hostname':1,
      'ping':1,'curl':1,'wget':1,'ifconfig':1,'ip':1,'netstat':1,'ss':1,'nslookup':1,'ssh':1,'scp':1,
      'tar':1,'gzip':1,'gunzip':1,'zip':1,'unzip':1,
      'git':1,'vim':1,'vi':1,'nano':1,'python3':1,'python':1,'gcc':1,'make':1,
      'apt':1,'apt-get':1,'dpkg':1,'snap':1,'systemctl':1,'service':1,
      'mount':1,'umount':1,'fdisk':1,'lsblk':1,'swapon':1,
      'sync':1,'reboot':1,'shutdown':1,'halt':1,'poweroff':1,
      'sleep':1,'yes':1,'seq':1,'bc':1,'expr':1,'test':1,'true':1,'false':1,
      'time':1,'nohup':1,'xargs':1,'tee':1,'watch':1,
      'lsof':1,'lsmod':1,'lsusb':1,'lscpu':1,'dmesg':1,'journalctl':1,
      'crontab':1,'at':1,'batch':1,'atq':1,'atrm':1,'last':1,'lastlog':1,'w':1,'finger':1,
      'su':1,'sudo':1,'useradd':1,'usermod':1,'userdel':1,'passwd':1,
      'groupadd':1,'groupdel':1,'newgrp':1,'gpasswd':1,
      'neofetch':1,'screenfetch':1,'htop':1,
      'ssh-keygen':1,'ssh-copy-id':1,'ssh-agent':1,'ssh-add':1,'sshfs':1,'sftp':1,'rsync':1,
      'strace':1,'ltrace':1,'nc':1,'ncat':1,'socat':1,'tcpdump':1,
      'nmap':1,'traceroute':1,'mtr':1,'route':1,'arp':1,
      'iptables':1,'ufw':1,'firewall-cmd':1,
      'docker':1,'podman':1,'kubectl':1,'helm':1,'terraform':1,'ansible':1,
      'npm':1,'npx':1,'node':1,'yarn':1,'pnpm':1,'bun':1,'deno':1,
      'php':1,'ruby':1,'perl':1,'lua':1,'go':1,'rustc':1,'cargo':1,
      'java':1,'javac':1,'gradle':1,'mvn':1,'dotnet':1,
      'r':1,'R':1,'julia':1,'matlab':1,
      'tmux':1,'screen':1,'byobu':1,
      'zsh':1,'fish':1,'csh':1,'ksh':1,'dash':1,'ash':1,
    })
    if (allCmds.includes(args[0])) return `/usr/bin/${args[0]}`
    return `no ${args[0]} in (/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin)`
  }

  cmdFile(args) {
    if (!args.length) return 'file: missing operand'
    const resolved = this.resolvePath(args[0])
    const node = this.getNode(resolved)
    if (!node) return `${args[0]}: cannot open (No such file or directory)`
    if (node.type === 'dir') return `${args[0]}: directory`
    const content = node.content || ''
    if (content.startsWith('#!')) return `${args[0]}: POSIX shell script, ASCII text executable`
    if (content.includes('print(') || content.includes('def ')) return `${args[0]}: Python script, UTF-8 Unicode text executable`
    if (content.startsWith('#include')) return `${args[0]}: C source, ASCII text`
    if (content.startsWith('#!') && content.includes('python')) return `${args[0]}: Python script, UTF-8 Unicode text executable`
    if (content.startsWith('#')) return `${args[0]}: ASCII text`
    if (content.includes('<!DOCTYPE') || content.includes('<html')) return `${args[0]}: HTML document, ASCII text`
    if (content.includes('[binary data')) return `${args[0]}: data`
    return `${args[0]}: UTF-8 Unicode text`
  }

  cmdNeofetch() {
    const uptimeMs = Date.now() - this.uptime
    const days = Math.floor(uptimeMs / 86400000)
    const hours = Math.floor((uptimeMs % 86400000) / 3600000)
    const mins = Math.floor((uptimeMs % 3600000) / 60000)
    return `\x1b[1;32m        .--.        \x1b[0m  \x1b[1;36muser\x1b[0m@\x1b[1;36mglassos\x1b[0m
\x1b[1;32m       |o_o |       \x1b[0m  ──────────────────
\x1b[1;32m       |:_/ |       \x1b[0m  \x1b[1;33mOS:\x1b[0m GlassOS 1.0 (Linux 6.1.0)
\x1b[1;32m      //   \\ \\      \x1b[0m  \x1b[1;33mHost:\x1b[0m GlassOS Desktop
\x1b[1;32m     (|     | )     \x1b[0m  \x1b[1;33mKernel:\x1b[0m 6.1.0-glassos
\x1b[1;32m    /'\\_   _/\x60\\     \x1b[0m  \x1b[1;33mUptime:\x1b[0m ${days} days, ${hours} hours, ${mins} mins
\x1b[1;32m    \\___)=(___/     \x1b[0m  \x1b[1;33mShell:\x1b[0m bash 5.2.15
\x1b[0m                    \x1b[0m  \x1b[1;33mTerminal:\x1b[0m GlassOS Terminal
\x1b[0m                    \x1b[0m  \x1b[1;33mCPU:\x1b[0m Intel i7-8700 @ 3.20GHz
\x1b[0m                    \x1b[0m  \x1b[1;33mMemory:\x1b[0m 4000MiB / 16000MiB
\x1b[0m`
  }
}
