#!/usr/bin/env python3
"""
代码文件合并工具 - 将多个代码文件合并为一个文件
使用方法:
    python merge_code_files.py [源目录] [文件扩展名列表(可选)]

示例:
    python merge_code_files.py ./my_project
    python merge_code_files.py ./my_project py,js,html,css
    python merge_code_files.py  # 使用当前目录，生成默认文件名
"""

import os
import sys
from datetime import datetime

# 默认要处理的文件扩展名
DEFAULT_EXTENSIONS = [
    'py', 'js', 'html', 'css', 'java', 'c', 'cpp', 'h', 'hpp', 
    'cs', 'go', 'rs', 'ts', 'tsx', 'jsx', 'php', 'rb', 'swift',
    'kt', 'scala', 'sh', 'bat', 'ps1', 'sql', 'r', 'json', 'xml',
    'yaml', 'yml', 'toml', 'vue'
]

# 要忽略的目录
IGNORED_DIRS = [
    '.git', '.svn', '.hg', '.idea', '.vscode', 
    'node_modules', 'venv', 'env', '__pycache__', 
    'dist', 'build', 'target', 'bin', 'obj'
]

# 要忽略的文件
SCRIPT_NAME = os.path.basename(__file__)  # 获取脚本自身文件名

def should_process_file(filename, filepath, extensions, output_file_prefix="merged_code_"):
    """判断文件是否应该被处理"""
    # 跳过脚本自身
    if filename == SCRIPT_NAME:
        return False
        
    # 跳过生成的合并文件（.txt文件且以指定前缀开头）
    if filename.endswith('.txt') and filename.startswith(output_file_prefix):
        return False
        
    # 检查扩展名
    ext = filename.split('.')[-1].lower() if '.' in filename else ''
    return ext in extensions

def should_process_dir(dirname):
    """判断目录是否应该被处理"""
    base_dir = os.path.basename(dirname)
    return base_dir not in IGNORED_DIRS and not base_dir.startswith('.')

def merge_files(source_dir, output_file, extensions):
    """
    遍历目录，合并所有符合条件的文件
    
    Args:
        source_dir: 源目录
        output_file: 输出文件名
        extensions: 要处理的文件扩展名列表
    """
    file_count = 0
    total_lines = 0
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        # 写入标题和生成时间
        outfile.write(f"# 合并的代码文件\n")
        outfile.write(f"# 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        outfile.write(f"# 源目录: {os.path.abspath(source_dir)}\n\n")
        
        # 遍历目录和子目录
        for root, dirs, files in os.walk(source_dir):
            # 过滤掉不需要处理的目录
            dirs[:] = [d for d in dirs if should_process_dir(os.path.join(root, d))]
            
            # 处理文件
            for filename in files:
                filepath = os.path.join(root, filename)
                rel_path = os.path.relpath(filepath, source_dir)
                
                if should_process_file(filename, filepath, extensions, output_file_prefix="merged_code_"):
                    try:
                        with open(filepath, 'r', encoding='utf-8', errors='replace') as infile:
                            content = infile.read()
                            line_count = content.count('\n') + 1
                            total_lines += line_count
                            
                            # 写入文件分隔标记
                            outfile.write(f"\n\n{'=' * 80}\n")
                            outfile.write(f"# 文件: {rel_path}\n")
                            outfile.write(f"# 行数: {line_count}\n")
                            outfile.write(f"{'=' * 80}\n\n")
                            
                            # 写入文件内容
                            outfile.write(content)
                            outfile.write("\n")
                            
                            file_count += 1
                            print(f"已处理: {rel_path}")
                    except Exception as e:
                        print(f"无法处理文件 {rel_path}: {str(e)}")
    
    print(f"\n合并完成! 共处理了 {file_count} 个文件, {total_lines} 行代码")
    print(f"输出文件: {os.path.abspath(output_file)}")

def main():
    # 解析命令行参数
    source_dir = "."  # 默认为当前目录
    
    if len(sys.argv) > 1:
        source_dir = sys.argv[1]
    
    # 生成默认输出文件名
    project_name = os.path.basename(os.path.abspath(source_dir))
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = f"merged_code_{project_name}_{timestamp}.txt"
    
    # 处理可选的文件扩展名参数
    extensions = DEFAULT_EXTENSIONS
    if len(sys.argv) > 2:
        extensions = [ext.strip().lower() for ext in sys.argv[2].split(',')]
    
    print(f"源目录: {source_dir}")
    print(f"输出文件: {output_file}")
    print(f"要处理的文件类型: {', '.join(extensions)}")
    print("-" * 60)
    
    # 检查源目录是否存在
    if not os.path.isdir(source_dir):
        print(f"错误: 源目录 '{source_dir}' 不存在!")
        sys.exit(1)
    
    # 执行合并
    merge_files(source_dir, output_file, extensions)

if __name__ == "__main__":
    main()