# CHEM 120 E-Textbook

## Setting up
1. Install `Homebrew` and use it to install `npm` and `nvm`. (For MacOS)
2. Add the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension to `Visual Studio Code` for debugging.

3. Set up the SSH key on your computer
  
  - Follow steps 1-4 of the instruction to [Generate a new SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key)
  - Follow steps 1-9 of the instruction to [Add a new SSH key to your GitHub account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key)

4. Clone the repo to your local computer

        git clone git@github.com:anhphuongdo34/chem120-e-textbook.git
        npm install
        
## Contribution
(replace anything with the `<>` with your own content)

1. Before making any changes run `git pull`. The make changes in the code on the `master` branch

2. Create a new branch. If the changes associate with a specific `issue`, name the branch after the number of the issue.

        git checkout -b <branch_name>

3. Pull all the updates from upstream before commit new changes

        git stash
        git fetch upstream
        git rebase upstream/master

4. Add, commit, and push the changes

        git stash apply
        
Might need to resolve merge conflicts. Follow the instruction on the terminal.

        git add .
        git commit -m "<a short description of the changes>"
        git push origin/<branch_name>

5. Make a Pull Request (PR) on GitHub.

## Acknowledgement

This project uses ChemDoodle Web Components. The link to [web.ChemDoodle.com](web.ChemDoodle.com) and/or [www.ChemDoodle.com](www.ChemDoodle.com).
