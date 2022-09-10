# CHEM 120 E-Textbook

## Setting up

(Assuming that you have had `npm` and `Visual Studio Code` ready in your computer)
1. Add the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension to `Visual Studio Code` for debugging.

2. Set up the SSH key on your computer
  
  - Follow steps 1-4 of the instruction to [Generate a new SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key)
  - Follow steps 1-9 of the instruction to [Add a new SSH key to your GitHub account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key)

3. Clone the repo to your local computer

        git clone git@github.com:anhphuongdo34/chem120-e-textbook.git
        npm install
        
## Contribution
(replace anything with the `<>` with your own content)

1. Before making any changes run `git pull`. The make changes in the code on the `master` branch

2. Create a new branch. If the changes associate with a specific `issue`, name the branch after the number of the issue.

        git checkout -b <branch_name>

3. Pull all the updates from upstream before commit new changes

        git stash
        git fetch origin
        git rebase origin/master

4. Add, commit, and push the changes

        git stash apply
        
Might need to resolve merge conflicts. Follow the instruction on the terminal.

        git add .
        git commit -m "<a short description of the changes>"
        git push origin/<branch_name>

5. Make a Pull Request (PR) on GitHub.

## Acknowledgement

If you use ChemDoodle Web Components in your website or product, we request that you provide a link on your site to web.ChemDoodle.com and/or www.ChemDoodle.com. When using the SketcherCanvas or EditorCanvas3D components, you are not allowed to remove any of our links or logos.
