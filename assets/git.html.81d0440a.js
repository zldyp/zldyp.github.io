import{_ as e,o as i,c as a,e as d}from"./app.c9710ffe.js";const n={},t=d(`<h2 id="github-上传报错" tabindex="-1"><a class="header-anchor" href="#github-上传报错" aria-hidden="true">#</a> github 上传报错</h2><ol><li>远程仓库名称变成了main 解决方式： 重命名本地分支： <code>git branch -m oldBranchName newBranchName</code></li></ol><h2 id="git-子模块" tabindex="-1"><a class="header-anchor" href="#git-子模块" aria-hidden="true">#</a> git 子模块</h2><h3 id="添加子模块" tabindex="-1"><a class="header-anchor" href="#添加子模块" aria-hidden="true">#</a> 添加子模块</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>git submodule add https://github.com/iphysresearch/GWToolkit.git GWToolkit
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="更新子模块" tabindex="-1"><a class="header-anchor" href="#更新子模块" aria-hidden="true">#</a> 更新子模块</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>git submodule init
git submodule update
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="子模块上传" tabindex="-1"><a class="header-anchor" href="#子模块上传" aria-hidden="true">#</a> 子模块上传</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>git branch new
git checkout new
git add .
git commit -m &quot;update&quot;
git checkout main
git merge new
git push origin main

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,9),s=[t];function r(l,c){return i(),a("div",null,s)}const h=e(n,[["render",r],["__file","git.html.vue"]]);export{h as default};
